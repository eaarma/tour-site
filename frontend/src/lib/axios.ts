import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// ===============================
// Refresh token logic
// ===============================
let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onAccessTokenRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: () => void) {
  refreshSubscribers.push(callback);
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    console.log(
      "🔥 Interceptor got",
      error.response?.status,
      error.config?.url
    );
    const { response, config } = error;

    const originalRequest = config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!response) return Promise.reject(error);

    const status = response.status;

    // 🛑 FIX: prevent infinite refresh loop on login page
    if (typeof window !== "undefined") {
      const publicPaths = ["/auth/login", "/auth/register"];
      const currentPath = window.location.pathname;

      if (publicPaths.includes(currentPath)) {
        return Promise.reject(error);
      }
    }

    // Skip if:
    // - not 401
    // - already retried
    // - auth endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout");

    if (status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Queue pending requests
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber(() => {
          api(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    // Perform refresh
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

      return Promise.reject(refreshError);
    }
  }
);

export default api;
