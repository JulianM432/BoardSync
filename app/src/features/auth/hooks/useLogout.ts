import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authAPI } from "@/features/auth/api/auth";
import { meQueryOptions } from "@/features/auth/api/queries";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authAPI.logout,
    onSettled: async () => {
      queryClient.clear();
      queryClient.setQueryData(meQueryOptions.queryKey, null);
      await navigate({ to: "/login" });
    },
  });
}
