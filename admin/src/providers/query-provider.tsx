"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "./AuthProvider";
import { toast } from "@/lib/toast";
import { parseApiError } from "@/lib/errors";

function shouldSkipErrorToast(meta: Record<string, unknown> | undefined) {
  return Boolean(meta?.skipErrorToast);
}

function handleQueryError(error: unknown, meta?: Record<string, unknown>) {
  if (shouldSkipErrorToast(meta)) return;
  const parsed = parseApiError(error, "Failed to load data");
  if (parsed.isUnauthorized) return;
  toast.error(parsed.title, parsed.message);
}

function handleMutationError(error: unknown, meta?: Record<string, unknown>) {
  if (shouldSkipErrorToast(meta)) return;
  const parsed = parseApiError(error, "Action failed");
  if (parsed.isUnauthorized) return;
  toast.error(parsed.title, parsed.message);
}

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => handleQueryError(error, query.meta),
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) =>
        handleMutationError(error, mutation.meta),
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const parsed = parseApiError(error);
          if (parsed.isUnauthorized || parsed.isForbidden || parsed.status === 404) {
            return false;
          }
          return failureCount < 1;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
