import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { getApiErrorStatus } from "@/lib/axios-config";

const MAX_RETRIES = 2;

const isClientError = (error: unknown) => {
  const status = getApiErrorStatus(error);
  return status !== undefined && status >= 400 && status < 500;
};

export function createQueryClient(onUnauthorized: () => void) {
  const handleError = (error: unknown) => {
    if (getApiErrorStatus(error) === 401) {
      onUnauthorized();
    }
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          !isClientError(error) && failureCount < MAX_RETRIES,
      },
    },
  });
}
