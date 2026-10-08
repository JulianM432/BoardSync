import { apiClient } from "./axios-config";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "@/schemas/auth";

export const authAPI = {
  login: async (input: LoginCredentials): Promise<User> => {
    const { data } = await apiClient.post("/auth/login", input);
    return data;
  },
  logout: async (): Promise<void> => {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  },
  register: async (input: RegisterCredentials): Promise<User> => {
    const { data } = await apiClient.post("/auth/register", input);
    return data;
  },
};
