import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("mini_ledger_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});