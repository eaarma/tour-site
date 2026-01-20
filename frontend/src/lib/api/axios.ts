import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";
import qs from "qs";

import { store } from "@/store/store";
import { clearUser, setAccessToken } from "@/store/authSlice";
import { markExpired } from "@/store/sessionSlice";
import { ApiError } from "./ApiError";

const NETWORK_ERROR_TOAST_ID = "network-error";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // needed for refreshToken cookie
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

/* =====================================================
   REQUEST INTERCEPTOR
   - attach Authorization header ONLY
   ===================================================== */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers);

  const accessToken = store.getState().auth.accessToken;
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  config.headers = headers;
  return config;
});

/* =====================================================
   REFRESH COORDINATION
   ===================================================== */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

/* =====================================================
   RESPONSE INTERCEPTOR
   - refresh access token on 401
   ===================================================== */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;

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

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout");

    /* =============================
       401 → REFRESH FLOW
       ============================= */
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const { user } = store.getState().auth;

      if (!user) {
        throw new ApiError(status, response.data);
      }

      originalRequest._retry = true;

      // ⏳ If refresh already running, wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token: string) => {
            const headers = AxiosHeaders.from(originalRequest.headers);
            headers.set("Authorization", `Bearer ${token}`);
            originalRequest.headers = headers;
            api(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await api.post("/auth/refresh", null, {
          headers: { "X-Refresh-Request": "true" },
        });

        const { accessToken } = refreshRes.data as { accessToken: string };

        store.dispatch(setAccessToken(accessToken));
        onRefreshed(accessToken);
        isRefreshing = false;

        const headers = AxiosHeaders.from(originalRequest.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        originalRequest.headers = headers;

        return api(originalRequest);
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];
        store.dispatch(clearUser());
        store.dispatch(markExpired());
        throw new ApiError(status, response.data);
      }
    }

    /* =============================
       STANDARD ERROR HANDLING
       ============================= */
    switch (status) {
      case 400:
        toast.error((response.data as any)?.message || "Bad request.");
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
  },
);

export default api;
