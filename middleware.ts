import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory sliding rate limiting store with proxy-verified IP and session isolation
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
let requestCounter = 0;

/**
 * Extract proxy-verified client IP address
 */
function getClientIp(request: NextRequest): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  return "127.0.0.1";
}

/**
 * Determine rate limit category and threshold
 */
function getRateLimitPolicy(pathname: string, method: string): { category: string; maxAttempts: number; windowMs: number } | null {
  // 1. PIN brute-force defense
  if (pathname === "/api/official/auth" && method === "POST") {
    return { category: "auth_pin", maxAttempts: 5, windowMs: 60 * 1000 };
  }

  // 2. Authentication flows (login, register, switch)
  if (pathname.startsWith("/api/auth/") && method === "POST") {
    const isDev = process.env.NODE_ENV !== "production";
    return { category: "auth_flow", maxAttempts: isDev ? 200 : 20, windowMs: 60 * 1000 };
  }

  // 3. Application and registration submissions
  if ((pathname === "/api/applications" || pathname.includes("/claim")) && method === "POST") {
    return { category: "submissions", maxAttempts: 15, windowMs: 60 * 1000 };
  }

  // 4. Live match chat & SSE event broadcasting
  if (pathname.includes("/live") && method === "POST") {
    return { category: "live_chat", maxAttempts: 30, windowMs: 60 * 1000 };
  }

  // 5. General API write mutations
  if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return { category: "api_mutation", maxAttempts: 100, windowMs: 60 * 1000 };
  }

  return null;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // 1. Core Security & Content-Security-Policy (CSP) Headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
    ].join("; ")
  );
  response.headers.delete("x-powered-by");

  // 2. Cross-Site Request Forgery (CSRF) & Origin Defense for mutating API calls
  if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const secFetchSite = request.headers.get("sec-fetch-site");
    if (secFetchSite === "cross-site") {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Cross-site request blocked (CSRF Protection)" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const origin = request.headers.get("origin");
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const host = request.headers.get("host") || "";
        if (originUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({ success: false, error: "Invalid origin header (Cross-Origin Blocked)" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ success: false, error: "Malformed origin header" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // 3. Shared Multi-tiered Rate Limiting by Proxy IP + Account + Category
  const policy = getRateLimitPolicy(pathname, method);
  if (policy) {
    const ip = getClientIp(request);
    const sessionToken = request.cookies.get("statcourt_session")?.value || "anon";
    const accountSlice = sessionToken !== "anon" ? sessionToken.slice(0, 12) : "anon";
    const rateLimitKey = `${policy.category}:${ip}:${accountSlice}`;
    const now = Date.now();

    // Clean up expired entries every 50 requests
    requestCounter += 1;
    if (requestCounter % 50 === 0) {
      rateLimitMap.forEach((item, key) => {
        if (now > item.resetTime) {
          rateLimitMap.delete(key);
        }
      });
    }

    const record = rateLimitMap.get(rateLimitKey);
    if (record && now < record.resetTime) {
      if (record.count >= policy.maxAttempts) {
        const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Too Many Requests: มีความพยายามส่งคำขอมากเกินไป กรุณารอสักครู่ (Rate limit exceeded)",
            category: policy.category,
            retryAfterSeconds: retryAfter,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": retryAfter.toString(),
              "X-RateLimit-Limit": policy.maxAttempts.toString(),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
      record.count += 1;
      response.headers.set("X-RateLimit-Limit", policy.maxAttempts.toString());
      response.headers.set("X-RateLimit-Remaining", Math.max(0, policy.maxAttempts - record.count).toString());
    } else {
      rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + policy.windowMs });
      response.headers.set("X-RateLimit-Limit", policy.maxAttempts.toString());
      response.headers.set("X-RateLimit-Remaining", (policy.maxAttempts - 1).toString());
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
