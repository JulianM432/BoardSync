import { Login } from "@/features/auth/components/Login";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { LoginCredentials } from "@/schemas/auth";
import { getApiErrorMessage } from "@/lib/axios-config";
import { useState } from "react";

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (input: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(input);
    } catch (err) {
      setError(getApiErrorMessage(err, "Error inesperado"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <Login onSubmit={handleSubmit} isSubmitting={isLoading} error={error} />
    </main>
  );
};
