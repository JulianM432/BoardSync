import { useState, type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { usersQueries } from "@/features/auth/api/queries";
import {
  useCreateBoard,
  useUpdateBoard,
} from "@/features/boards/hooks/useBoardMutations";
import {
  boardFormSchema,
  MEMBER_ROLES,
  type BoardDTO,
  type BoardFormValues,
  type BoardMemberDTO,
} from "@/schemas/board";

type MemberRole = BoardMemberDTO["role"];

const ROLE_ITEMS = MEMBER_ROLES.map((role) => ({
  value: role,
  label: role === "editor" ? "Editor" : "Viewer",
}));

const authenticatedRoute = getRouteApi("/_authenticated");

type BoardFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: BoardDTO;
};

export const BoardFormDialog = ({
  open,
  onOpenChange,
  board,
}: BoardFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{board ? "Editar board" : "Nuevo board"}</DialogTitle>
        </DialogHeader>
        <BoardForm board={board} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

type BoardFormProps = {
  board?: BoardDTO;
  onDone: () => void;
};

const BoardForm = ({ board, onDone }: BoardFormProps) => {
  const { user } = authenticatedRoute.useRouteContext();
  const ownerId = board?.ownerId._id ?? user.id;
  const { data: users = [], isPending: isLoadingUsers } = useQuery(
    usersQueries.list(),
  );

  const [values, setValues] = useState<BoardFormValues>({
    name: board?.name ?? "",
    members:
      board?.members.map((member) => ({
        userId: member.userId._id,
        role: member.role,
      })) ?? [],
  });
  const [nameError, setNameError] = useState<string | null>(null);
  const [newMemberId, setNewMemberId] = useState<string | null>(null);
  const [newMemberRole, setNewMemberRole] = useState<MemberRole>("editor");

  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard(board?._id ?? "");
  const isPending = createBoard.isPending || updateBoard.isPending;

  const usernames = new Map<string, string>();
  for (const member of board?.members ?? []) {
    usernames.set(member.userId._id, member.userId.username);
  }
  for (const candidate of users) {
    usernames.set(candidate._id, candidate.username);
  }

  const memberIds = new Set(values.members.map((member) => member.userId));
  const candidateItems = users
    .filter(
      (candidate) => candidate._id !== ownerId && !memberIds.has(candidate._id),
    )
    .map((candidate) => ({ value: candidate._id, label: candidate.username }));

  const setMemberRole = (userId: string, role: MemberRole) => {
    setValues((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.userId === userId ? { ...member, role } : member,
      ),
    }));
  };

  const removeMember = (userId: string) => {
    setValues((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.userId !== userId),
    }));
  };

  const addMember = () => {
    if (!newMemberId) {
      return;
    }
    setValues((prev) => ({
      ...prev,
      members: [...prev.members, { userId: newMemberId, role: newMemberRole }],
    }));
    setNewMemberId(null);
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = boardFormSchema.safeParse(values);
    if (!result.success) {
      setNameError(result.error.issues[0]?.message ?? "Nombre inválido");
      return;
    }
    if (board) {
      updateBoard.mutate(result.data, { onSuccess: onDone });
    } else {
      createBoard.mutate(result.data, { onSuccess: onDone });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6">
      <FieldGroup>
        <Field data-invalid={!!nameError}>
          <FieldLabel htmlFor="board-name">Nombre</FieldLabel>
          <Input
            id="board-name"
            autoFocus
            value={values.name}
            maxLength={200}
            aria-invalid={!!nameError}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, name: e.target.value }));
              setNameError(null);
            }}
          />
          <FieldError>{nameError}</FieldError>
        </Field>

        <FieldSet>
          <FieldLegend variant="label">Miembros</FieldLegend>
          {values.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Solo vos tenés acceso a este board.
            </p>
          ) : (
            <ul className="grid gap-2">
              {values.members.map((member) => {
                const username = usernames.get(member.userId) ?? "Usuario";
                return (
                  <li key={member.userId} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {username}
                    </span>
                    <Select
                      items={ROLE_ITEMS}
                      value={member.role}
                      onValueChange={(role) => {
                        if (role) {
                          setMemberRole(member.userId, role);
                        }
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-28"
                        aria-label={`Rol de ${username}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Quitar a ${username}`}
                      onClick={() => removeMember(member.userId)}
                    >
                      <X />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center gap-2">
            <Select
              items={candidateItems}
              value={newMemberId}
              onValueChange={setNewMemberId}
              disabled={isLoadingUsers || candidateItems.length === 0}
            >
              <SelectTrigger
                size="sm"
                className="min-w-0 flex-1"
                aria-label="Usuario a agregar"
              >
                <SelectValue
                  placeholder={
                    isLoadingUsers ? "Cargando usuarios..." : "Agregar usuario"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {candidateItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              items={ROLE_ITEMS}
              value={newMemberRole}
              onValueChange={(role) => {
                if (role) {
                  setNewMemberRole(role);
                }
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-28"
                aria-label="Rol del nuevo miembro"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Agregar miembro"
              disabled={!newMemberId}
              onClick={addMember}
            >
              <Plus />
            </Button>
          </div>
        </FieldSet>
      </FieldGroup>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={isPending} />}>
          Cancelar
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner />}
          {board ? "Guardar" : "Crear"}
        </Button>
      </DialogFooter>
    </form>
  );
};
