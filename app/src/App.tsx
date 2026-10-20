import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./features/auth/contexts/AuthProvider";
import { useAuth } from "./features/auth/hooks/useAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { Spinner } from "./components/ui/spinner";

function Routes() {
  const { user, status, logout } = useAuth();
  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </main>
    );
  }
  return user ? <HomePage user={user} onLogout={logout} /> : <LoginPage />;
}

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ThemeProvider>
  );
};
