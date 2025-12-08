import axios from "axios";

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
  }
);

api.interceptors.response.use(
  (response) => response,
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

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default api;
