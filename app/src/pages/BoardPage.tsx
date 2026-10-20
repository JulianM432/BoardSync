import { useSuspenseQueries } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { boardQueries } from "@/features/boards/api/queries";
import { Board } from "@/features/boards/components/Board";
import { BoardActions } from "@/features/boards/components/BoardActions";
import { RoleBadge } from "@/features/boards/components/RoleBadge";
import { useBoardRole } from "@/features/boards/hooks/useBoardRole";
import { getBoardUsers } from "@/features/boards/permissions";

const boardRoute = getRouteApi("/_authenticated/boards/$boardId");

export const BoardPage = () => {
  const { boardId } = boardRoute.useParams();
  const [{ data: board }, { data: columns }, { data: cards }] =
    useSuspenseQueries({
      queries: [
        boardQueries.detail(boardId),
        boardQueries.columns(boardId),
        boardQueries.cards(boardId),
      ],
    });
  const { role, can } = useBoardRole(board);

  return (
    <>
      <PageHeader title={board.name}>
        {role && <RoleBadge role={role} />}
        {can("board:manage") && (
          <div className="ml-auto">
            <BoardActions board={board} />
          </div>
        )}
      </PageHeader>
      <div className="min-h-0 flex-1">
        <Board
          boardId={boardId}
          columns={columns}
          cards={cards}
          assignees={getBoardUsers(board)}
          canManageColumns={can("column:manage")}
          canWriteCards={can("card:write")}
        />
      </div>
    </>
  );
};
