import { toast } from "@/lib/toast";
import { parseApiError } from "@/lib/errors";

export interface MutationFeedbackOptions {
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
}

export function showMutationSuccess(
  title: string,
  description?: string,
) {
  toast.success(title, description);
}

export function showMutationError(error: unknown, title = "Action failed") {
  const parsed = parseApiError(error, title);
  if (parsed.isUnauthorized) return;
  toast.error(parsed.title, parsed.message);
}

export function mutationFeedback(options: MutationFeedbackOptions = {}) {
  return {
    onSuccess: () => {
      if (options.successTitle) {
        showMutationSuccess(options.successTitle, options.successDescription);
      }
    },
    onError: (error: unknown) => {
      showMutationError(error, options.errorTitle);
    },
  };
}
