import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Board } from "@/features/boards/components/Board";
import { boardApi } from "@/features/boards/api/board";
import { columnAPI } from "@/features/boards/api/column";
import { cardAPI } from "@/features/boards/api/card";
import type { BoardDTO, CardDTO, ColumnDTO } from "@/schemas/board";
import type { User } from "@/schemas/auth";

type HomeProps = {
  onLogout: () => Promise<void>;
  user: User;
};

export const HomePage = ({ user, onLogout }: HomeProps) => {
  const [boards, setBoards] = useState<BoardDTO[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnDTO[]>([]);
  const [cards, setCards] = useState<CardDTO[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = async () => {
    setLoadingBoards(true);
    setError(null);
    try {
      const result = await boardApi.getBoards();
      setBoards(result);
    } catch {
      setError("No se pudieron cargar los boards.");
    } finally {
      setLoadingBoards(false);
    }
  };

  useEffect(() => {
     loadBoards();
  }, []);

  useEffect(() => {
    if (!activeBoardId) {
      setColumns([]);
      setCards([]);
      return;
    }

    let cancelled = false;
    setLoadingBoard(true);
    setError(null);
    Promise.all([
      columnAPI.getColumns(activeBoardId),
      cardAPI.getCards(activeBoardId),
    ])
      .then(([nextColumns, nextCards]) => {
        if (cancelled) {
          return;
        }
        setColumns(nextColumns);
        setCards(nextCards);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setColumns([]);
        setCards([]);
        setError("No se pudieron cargar las columnas y tarjetas del board.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingBoard(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeBoardId]);

  const activeBoard = boards.find((board) => board._id === activeBoardId);

  return (
    <SidebarProvider>
      <AppSidebar
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={setActiveBoardId}
        onCreateBoard={() =>
          setError("La creación de boards todavía no está implementada.")
        }
        user={user}
        onLogout={onLogout}
      />
      <SidebarInset className="h-dvh min-h-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="truncate text-sm font-semibold">
            {activeBoard?.name ??
              (loadingBoards ? "Cargando boards…" : "Sin board seleccionado")}
          </h1>
        </header>
        {error && (
          <p
            role="alert"
            className="border-b px-4 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <div className="min-h-0 flex-1">
          {loadingBoard ? (
            <p className="p-4 text-sm text-muted-foreground">Cargando board…</p>
          ) : activeBoardId ? (
            <Board columns={columns} cards={cards} />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              {loadingBoards
                ? "Cargando boards…"
                : "Creá o seleccioná un board para empezar."}
            </p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
