import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authAPI } from "@/features/auth/api/auth";
import { meQueryOptions } from "@/features/auth/api/queries";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (user) => {
      queryClient.setQueryData(meQueryOptions.queryKey, user);
      await router.invalidate();
    },
  });
}
