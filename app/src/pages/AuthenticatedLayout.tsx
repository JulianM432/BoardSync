import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { boardQueries } from "@/features/boards/api/queries";
import { BoardFormDialog } from "@/features/boards/components/BoardFormDialog";
import { useRealtimeConnection } from "@/features/boards/hooks/useRealtimeConnection";

const authenticatedRoute = getRouteApi("/_authenticated");

export const AuthenticatedLayout = () => {
  const { user } = authenticatedRoute.useRouteContext();
  const { data: boards } = useSuspenseQuery(boardQueries.list());
  const logout = useLogout();
  useRealtimeConnection();
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const canCreateBoards = user.role === "admin";

  return (
    <SidebarProvider>
      <AppSidebar
        boards={boards}
        user={user}
        onLogout={() => logout.mutate()}
        onCreateBoard={
          canCreateBoards ? () => setIsCreateBoardOpen(true) : undefined
        }
      />
      {canCreateBoards && (
        <BoardFormDialog
          open={isCreateBoardOpen}
          onOpenChange={setIsCreateBoardOpen}
        />
      )}
      <SidebarInset className="h-dvh min-h-0 min-w-0">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};
