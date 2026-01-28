import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { showErrorToast } from "./toast-helpers";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let csrfToken: string | null = null;

export async function fetchCsrfToken(): Promise<void> {
  try {
    const response = await api.get("/csrf-token");
    csrfToken = response.data.csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw error;
  }
}

// For testing purposes only
export function resetCsrfToken(): void {
  csrfToken = null;
}

api.interceptors.request.use(
  async (config) => {
    if (
      config.method &&
      ["post", "put", "delete", "patch"].includes(config.method.toLowerCase())
    ) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }

      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response, // in case of success, just return the response

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      error.response?.data?.error?.includes("CSRF") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      await fetchCsrfToken();

      if (csrfToken) {
        originalRequest.headers["X-CSRF-Token"] = csrfToken;
      }

      return api(originalRequest);
    }

    // Log errors in development mode
    if (import.meta.env.DEV) {
      // Don't log 401 errors on auth check - it's expected for unauthenticated users
      const isAuthCheck =
        originalRequest?.url === "/auth/current-user" &&
        error.response?.status === 401;

      if (!isAuthCheck) {
        console.error("API Error:", {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          data: error.response?.data,
        });
      }
    }

    // Automatic logout on 401 errors
    if (error.response?.status === 401) {
      const isAuthCheck = originalRequest?.url === "/auth/current-user";

      if (!isAuthCheck) {
        const logout = useAuthStore.getState().logout;
        logout();

        showErrorToast("Votre session a expiré. Veuillez vous reconnecter.");
      }
    }

    return Promise.reject(error);
  },
);

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default api;
