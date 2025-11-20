import axios from "axios";
import { authStore } from "../auth/authStore";

export const apiClient = axios.create({
    baseURL: "http://127.0.0.1:8000/",
    timeout: 50000,
})

apiClient.interceptors.request.use((config) => {
    const token = authStore.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

