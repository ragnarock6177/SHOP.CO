import axios from "axios";
import { parseApiError } from "./errors";

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
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const parsed = parseApiError(error);
    const status = parsed.status;

    if (status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("airave_admin_token");
        localStorage.removeItem("token");
        localStorage.removeItem("airave_admin_user");
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    const enriched = error;
    enriched.parsedApiError = parsed;
    return Promise.reject(enriched);
  },
);

export default apiClient;
