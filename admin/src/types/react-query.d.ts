import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Skip global mutation error toast (handle locally) */
      skipErrorToast?: boolean;
      /** Skip hook-level success toast (e.g. batch uploads) */
      silentSuccess?: boolean;
    };
    queryMeta: {
      /** Skip global query error toast (handle locally) */
      skipErrorToast?: boolean;
    };
  }
}
