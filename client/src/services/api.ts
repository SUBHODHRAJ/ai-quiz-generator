import axios from "axios";

const getBaseApiUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!envUrl) {
    return "http://localhost:5000/api";
  }
  let url = envUrl.replace(/\/+$/, "");
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
