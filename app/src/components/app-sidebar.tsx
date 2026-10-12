import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { User } from "@/schemas/auth";
import { LogOut, Plus } from "lucide-react";

export type BoardSummary = {
  _id: string;
  name: string;
};

type AppSidebarProps = {
  boards: BoardSummary[];
  activeBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
  user: User;
  onLogout: () => void;
};

export const AppSidebar = ({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  user,
  onLogout,
}: AppSidebarProps) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-semibold">Boards</h2>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Nuevo board"
            onClick={onCreateBoard}
          >
            <Plus />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {boards.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">
                Todavía no tenés boards. Creá el primero con el botón +.
              </p>
            ) : (
              <SidebarMenu>
                {boards.map((board) => (
                  <SidebarMenuItem key={board._id}>
                    <SidebarMenuButton
                      isActive={board._id === activeBoardId}
                      onClick={() => onSelectBoard(board._id)}
                    >
                      <span className="truncate">{board.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          {/* min-w-0: sin esto el truncate de los hijos no funciona dentro de un flex */}
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {user.username}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Cerrar sesión"
            onClick={onLogout}
          >
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};