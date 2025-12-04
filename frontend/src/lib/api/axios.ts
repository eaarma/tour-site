import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { ApiError } from "./ApiError";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// ========================================================
// Refresh Token Coordination
// ========================================================
let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onAccessTokenRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: () => void) {
  refreshSubscribers.push(callback);
}

// ========================================================
// Response Interceptor
// ========================================================
api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const { response, config } = error;

    console.log("🔥 Interceptor got", response?.status, config?.url);

    if (!response) {
      toast.error("Network error. Please check your connection.");
      throw new ApiError(0, { message: "Network error" });
    }

    const status = response.status;

    const originalRequest = config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Prevent toast spam on auth pages
    if (typeof window !== "undefined") {
      const publicPaths = ["/auth/login", "/auth/register"];
      if (publicPaths.includes(window.location.pathname)) {
        throw new ApiError(status, response.data);
      }
    }

    // Skip refresh logic for auth routes
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout");

    // ====================================================
    // 401 UNAUTHORIZED — attempt token refresh
    // ====================================================
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(() => {
            api(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      isRefreshing = true;

      try {
        await api.post("/auth/refresh", null, { withCredentials: true });
        isRefreshing = false;
        onAccessTokenRefreshed();

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login?sessionExpired=1";
        }

        throw new ApiError(status, response.data);
      }
    }

    // ====================================================
    // Global Error Toasts
    // ====================================================
    switch (status) {
      case 400:
        toast.error(response.data?.message || "Bad request.");
        break;

      case 403:
        toast.error("You do not have permission to do that.");
        break;

      case 404:
        toast.error("Resource not found.");
        break;

      case 500:
        toast.error("Server error. Please try again later.");
        break;

      default:
        toast.error("Unexpected error occurred.");
        break;
    }

    // Throw normalized error to component
    throw new ApiError(status, response.data);
  }
);

export default api;
