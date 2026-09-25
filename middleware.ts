import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple IP-based rate limiting map for Edge runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Security Headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.delete("x-powered-by");

  // 2. Rate limiting for Official Auth endpoint (prevent 4-digit PIN brute forcing)
  if (request.nextUrl.pathname === "/api/official/auth" && request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxAttempts = 5;

    const record = rateLimitMap.get(ip);
    if (record && now < record.resetTime) {
      if (record.count >= maxAttempts) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Too Many Requests: มีความพยายามเข้าสู่ระบบมากเกินไป กรุณารอ 1 นาที",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((record.resetTime - now) / 1000).toString(),
            },
          }
        );
      }
      record.count += 1;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
