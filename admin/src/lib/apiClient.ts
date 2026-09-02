import axios from "axios";

// Base API URL configuration defaulting to http://localhost:5000/api/v1
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
  timeout: 30000,
});

// Request Interceptor: Automatic Authorization header injection
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("airave_admin_token") || localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { toast } from "./toast";

// Response Interceptor: Standardized error parsing & 401 Unauthorized handling & Global Toast Errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message =
      data?.message ||
      data?.error ||
      error.message ||
      "An unexpected server error occurred.";

    if (status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("airave_admin_token");
        localStorage.removeItem("token");
        localStorage.removeItem("airave_admin_user");
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    } else {
      // Show error toast for all other errors when running in the browser
      if (typeof window !== "undefined" && !(error.config as any)?.__skipGlobalErrorToast) {
        toast.error(message);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
