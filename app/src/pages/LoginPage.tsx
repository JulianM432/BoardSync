import { Login } from "@/features/auth/components/Login";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { getApiErrorMessage } from "@/lib/axios-config";

export const LoginPage = () => {
  const login = useLogin();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <Login
        onSubmit={(input) => login.mutate(input)}
        isSubmitting={login.isPending}
        error={
          login.error
            ? getApiErrorMessage(login.error, "Error inesperado")
            : null
        }
      />
    </main>
  );
};
