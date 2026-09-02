import { toast as sonnerToast, ExternalToast } from "sonner";

export interface ToastOptions extends Omit<ExternalToast, "description"> {
  description?: string;
}

export const toast = {
  success: (message: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.success(message, opts);
  },
  error: (message: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.error(message, opts);
  },
  warning: (message: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.warning(message, opts);
  },
  info: (message: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.info(message, opts);
  },
  loading: (message: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.loading(message, opts);
  },
  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
};

export default toast;
