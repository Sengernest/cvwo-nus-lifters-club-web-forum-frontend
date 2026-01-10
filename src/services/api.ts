import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const baseURL = process.env.REACT_APP_API_URL || "https://localhost:8080";

const API = axios.create({ baseURL });

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    (
      config.headers as Record<string, string>
    ).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
