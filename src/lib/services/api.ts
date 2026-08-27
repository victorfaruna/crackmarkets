import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from "axios";

/// Constants ────────────────────────────────────────────────────────────────
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api";

/// Axios Instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/// Response Interceptor — Handle 401 & Token Refresh ───────────────────────
/** Prevents multiple simultaneous refresh calls */
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

function processPendingQueue(error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  // Pass through successful responses unchanged
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt a refresh on 401 and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request until it's done
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: () => {
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Exchange the refresh token (sent automatically as a cookie) for a new token pair
      await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      processPendingQueue(null);

      // Retry the original request (cookies and tokens are fetched automatically if needed)
      return api(originalRequest);
    } catch (refreshError) {
      processPendingQueue(refreshError);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Exports ──────────────────────────────────────────────────────────────────

export default api;
