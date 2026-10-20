import { queryOptions } from "@tanstack/react-query";
import { usersAPI } from "@/features/auth/api/users";
import { getApiErrorStatus } from "@/lib/axios-config";

export const meQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    try {
      return await usersAPI.me();
    } catch (error) {
      if (getApiErrorStatus(error) === 401) {
        return null;
      }
      throw error;
    }
  },
  staleTime: Infinity,
  retry: false,
});
