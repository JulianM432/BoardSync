import { Login } from "@/components/auth/Login";
import { useAuth } from "@/contexts/AuthProvider";
import type { LoginCredentials } from "@/schemas/auth";
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
      setError(err instanceof Error ? err.message : "Error inesperado");
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
