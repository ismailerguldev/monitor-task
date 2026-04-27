import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      resolve(api(config));
    }
  });
  failedQueue = [];
};

// URLs that should NEVER trigger the refresh interceptor
const SKIP_REFRESH_URLS = ['/auth/me', '/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return false;
  return SKIP_REFRESH_URLS.some((skipUrl) => url.includes(skipUrl));
}

// Response interceptor: Handle 401 → Refresh → Retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401, not already retrying, and not a skip URL
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt token refresh
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });

        // Refresh succeeded — retry all queued requests
        processQueue(null);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — reject all queued requests
        processQueue(refreshError as AxiosError);

        // Do NOT redirect here — let the AuthGuard handle routing
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
