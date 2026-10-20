import { useEffect, useState, type ReactNode } from "react";
import { authAPI } from "@/features/auth/api/auth";
import { usersAPI } from "@/features/auth/api/users";
import {
  AuthContext,
  type AuthStatus,
} from "@/features/auth/contexts/auth-context";
import type { LoginCredentials, User } from "@/schemas/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const data = await usersAPI.me();
        setUser(data);
        setStatus("authenticated");
      } catch {
        setUser(null);
        setStatus("anonymous");
      }
    };
    void checkUserStatus();
  }, []);

  const login = async (input: LoginCredentials) => {
    const userData = await authAPI.login(input);
    setUser(userData);
    setStatus("authenticated");
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    setUser(null);
    setStatus("anonymous");
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
