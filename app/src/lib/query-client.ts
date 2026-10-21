import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/axios-config";

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
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        handleError(error);
        if (
          getApiErrorStatus(error) !== 401 &&
          mutation.meta?.silentError !== true
        ) {
          toast.error(
            getApiErrorMessage(error, "No se pudo guardar el cambio"),
          );
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          !isClientError(error) && failureCount < MAX_RETRIES,
      },
    },
  });
}
