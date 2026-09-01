/**
 * In-Flight & Short TTL Request Deduplication Cache
 * Guarantees that duplicate HTTP requests with identical URL & payload
 * within the same execution frame / short TTL window return the same Promise
 * or cached response, preventing double fetches across StrictMode and multi-component mounts.
 */

const pendingRequests = new Map<string, Promise<any>>();
const responseCache = new Map<string, { data: any; timestamp: number }>();

const DEFAULT_TTL_MS = 3000; // 3 seconds TTL for client-side GET deduplication

export async function dedupedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  // 1. Check if valid cached response exists within TTL
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  // 2. Check if an identical request is currently in-flight
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  // 3. Execute request and store pending Promise
  const requestPromise = fetcher()
    .then((data) => {
      responseCache.set(key, { data, timestamp: Date.now() });
      pendingRequests.delete(key);
      return data;
    })
    .catch((error) => {
      pendingRequests.delete(key);
      throw error;
    });

  pendingRequests.set(key, requestPromise);
  return requestPromise;
}

export function clearFetchCache(key?: string) {
  if (key) {
    pendingRequests.delete(key);
    responseCache.delete(key);
  } else {
    pendingRequests.clear();
    responseCache.clear();
  }
}
