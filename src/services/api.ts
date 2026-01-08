import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API = axios.create({
  baseURL: "https://cvwo-nus-lifters-club-web-forum-backend.onrender.com",
});

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
