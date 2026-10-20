import { apiClient } from "@/lib/axios-config";
import type { User } from "@/schemas/auth";
import type { UserRef } from "@/schemas/board";

export const usersAPI = {
  me: async (): Promise<User> => {
    const { data } = await apiClient.get("/users/me");
    return data;
  },
  getAll: async (): Promise<UserRef[]> => {
    const { data } = await apiClient.get("/users");
    return data;
  },
};
