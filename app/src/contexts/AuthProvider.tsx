import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authAPI } from "@/api/auth";
import type { LoginCredentials, User } from "@/schemas/auth";
import { usersAPI } from "@/api/users";

type AuthContextValue = {
  user: User | null;
  login: (input: LoginCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const data = await usersAPI.me();
    setUser(data);
  };

  const login = async (input: LoginCredentials) => {
    const userData = await authAPI.login(input);
    setUser(userData);
  };
  const logout = async () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
