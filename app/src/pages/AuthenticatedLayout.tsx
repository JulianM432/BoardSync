import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { boardQueries } from "@/features/boards/api/queries";

const authenticatedRoute = getRouteApi("/_authenticated");

export const AuthenticatedLayout = () => {
  const { user } = authenticatedRoute.useRouteContext();
  const { data: boards } = useSuspenseQuery(boardQueries.list());
  const logout = useLogout();

  return (
    <SidebarProvider>
      <AppSidebar
        boards={boards}
        user={user}
        onLogout={() => logout.mutate()}
      />
      <SidebarInset className="h-dvh min-h-0">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};
