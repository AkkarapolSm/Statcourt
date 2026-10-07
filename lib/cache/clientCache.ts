"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache store surviving route transitions
const memoryCache = new Map<string, CacheEntry<any>>();

// In-flight promise tracker to deduplicate identical requests
const pendingRequests = new Map<string, Promise<any>>();

const DEFAULT_STALE_TIME_MS = 60 * 1000; // 60 seconds

/**
 * Fetch data with in-memory caching and request deduplication.
 */
export async function fetchWithCache<T>(
  url: string,
  staleTimeMs = DEFAULT_STALE_TIME_MS
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(url) as CacheEntry<T> | undefined;

  // If cache is fresh, return immediately
  if (cached && now - cached.timestamp < staleTimeMs) {
    return cached.data;
  }

  // Deduplicate in-flight requests for the same URL
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url) as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from ${url}`);
      }
      const json = await res.json();
      memoryCache.set(url, { data: json, timestamp: Date.now() });
      return json as T;
    } finally {
      pendingRequests.delete(url);
    }
  })();

  pendingRequests.set(url, fetchPromise);
  return fetchPromise;
}

/**
 * React hook for high-performance SWR-style data fetching.
 * Instantly supplies cached data on navigation with background revalidation.
 */
export function useCachedData<T>(
  url: string | null,
  options?: {
    initialData?: T;
    staleTimeMs?: number;
  }
) {
  const staleTime = options?.staleTimeMs ?? DEFAULT_STALE_TIME_MS;
  const initial = options?.initialData as T;

  // Get current cache if available
  const existingCache = url ? (memoryCache.get(url)?.data as T | undefined) : undefined;

  const [data, setData] = useState<T>(existingCache !== undefined ? existingCache : initial);
  const [loading, setLoading] = useState<boolean>(!existingCache && existingCache === undefined && !!url);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const loadData = useCallback(
    async (force = false) => {
      if (!url) return;

      const now = Date.now();
      const cached = memoryCache.get(url);

      // If we have cached data, update state immediately if not already set
      if (cached) {
        setData(cached.data);
        if (!force && now - cached.timestamp < staleTime) {
          setLoading(false);
          return;
        }
      }

      // If no cached data, we must show loading state
      if (!cached) {
        setLoading(true);
      }

      try {
        const result = await fetchWithCache<T>(url, force ? 0 : staleTime);
        if (isMountedRef.current) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [url, staleTime]
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadData();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  const mutate = useCallback(
    (newData: T) => {
      if (url) {
        memoryCache.set(url, { data: newData, timestamp: Date.now() });
      }
      setData(newData);
    },
    [url]
  );

  const refresh = useCallback(() => loadData(true), [loadData]);

  return { data, loading, error, mutate, refresh };
}
