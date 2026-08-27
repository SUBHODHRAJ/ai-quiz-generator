import axios from "axios";

const DEFAULT_PROD_API_URL = "https://miniquizgenerator-production.up.railway.app/api";

export const getBaseApiUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  const isBrowser = typeof window !== "undefined";
  const isHttps = isBrowser && window.location.protocol === "https:";
  const isLocalhost = isBrowser && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0"
  );

  let url: string;

  if (envUrl) {
    url = envUrl;
  } else if (!isLocalhost && isBrowser) {
    // When running in production (e.g. on Railway/Vercel/custom domain)
    url = DEFAULT_PROD_API_URL;
  } else {
    // Local development fallback
    url = "http://localhost:5000/api";
  }

  // If page is loaded over HTTPS, enforce HTTPS for non-localhost endpoints to avoid mixed-content blocks
  if (isHttps && url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
    url = url.replace(/^http:\/\//i, "https://");
  }

  // If on a production domain and URL accidentally still points to localhost, redirect to production backend
  if (isBrowser && !isLocalhost && (url.includes("localhost") || url.includes("127.0.0.1"))) {
    url = DEFAULT_PROD_API_URL;
  }

  // Normalize: strip trailing slash and ensure /api suffix
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }

  return url;
};

const api = axios.create({
  baseURL: getBaseApiUrl(),
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

api.interceptors.request.use((config) => {
  // Ensure baseURL stays aligned with current runtime environment
  const currentBase = getBaseApiUrl();
  if (config.baseURL !== currentBase && (!config.url || !config.url.startsWith("http"))) {
    config.baseURL = currentBase;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    if (typeof (config.headers as any).delete === "function") {
      (config.headers as any).delete("Content-Type");
      (config.headers as any).delete("content-type");
    } else {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default api;
