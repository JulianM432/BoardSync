import { apiClient } from "../../../lib/axios-config";
import type { User } from "@/schemas/auth";

export const usersAPI = {
  me: async (): Promise<User> => {
    const { data } = await apiClient.get("/users/me");
    return data;
  },
};
