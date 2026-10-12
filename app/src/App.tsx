import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider, useAuth } from "./features/auth/contexts/AuthProvider";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

function Routes() {
  const { user, logout } = useAuth();
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
