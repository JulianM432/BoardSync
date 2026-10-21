import axios, { isAxiosError } from "axios";
import { socket } from "@/lib/socket";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (socket.id) {
    config.headers.set("x-socket-id", socket.id);
  }
  return config;
});

export function getApiErrorMessage(
  error: unknown,
  fallback = "No se pudo cargar la información",
): string {
  if (
    isAxiosError<{ message?: string }>(error) &&
    error.response?.data?.message
  ) {
    return error.response.data.message;
  }
  return fallback;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}
