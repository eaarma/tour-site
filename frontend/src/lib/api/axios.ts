import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { ApiError } from "./ApiError";
import { store } from "@/store/store";
import { markExpired } from "@/store/sessionSlice";
import { clearUser } from "@/store/authSlice";
import qs from "qs";
import Cookies from "js-cookie"; // 🔑 ADD THIS

const NETWORK_ERROR_TOAST_ID = "network-error";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN", // keep (harmless)
  xsrfHeaderName: "X-XSRF-TOKEN", // keep (harmless)
  paramsSerializer: (params) =>
    qs.stringify(params, {
      arrayFormat: "repeat",
    }),
});

// ========================================================
// CSRF REQUEST INTERCEPTOR (🔥 THIS IS THE FIX)
// ========================================================
api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get("XSRF-TOKEN");

  if (csrfToken) {
    config.headers = config.headers ?? {};
    config.headers["X-XSRF-TOKEN"] = csrfToken;
  }

  return config;
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
      toast.error("Network error. Please check your connection.", {
        id: NETWORK_ERROR_TOAST_ID,
      });
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
    // 401 UNAUTHORIZED — attempt token refresh (ONLY if logged in)
    // ====================================================
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const state = store.getState();
      const isLoggedIn = !!state.auth.user;

      if (!isLoggedIn) {
        throw new ApiError(status, response.data);
      }

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
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];

        store.dispatch(clearUser());
        store.dispatch(markExpired());

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

    throw new ApiError(status, response.data);
  }
);

export default api;
