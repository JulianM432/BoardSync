import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateColumn,
  useUpdateColumn,
} from "@/features/boards/hooks/useColumnMutations";
import { columnFormSchema, type ColumnDTO } from "@/schemas/board";

type ColumnFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  column?: ColumnDTO;
};

export const ColumnFormDialog = ({
  open,
  onOpenChange,
  boardId,
  column,
}: ColumnFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {column ? "Renombrar columna" : "Nueva columna"}
          </DialogTitle>
        </DialogHeader>
        <ColumnForm
          boardId={boardId}
          column={column}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

type ColumnFormProps = {
  boardId: string;
  column?: ColumnDTO;
  onDone: () => void;
};

const ColumnForm = ({ boardId, column, onDone }: ColumnFormProps) => {
  const [name, setName] = useState(column?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const createColumn = useCreateColumn(boardId);
  const updateColumn = useUpdateColumn(boardId);
  const isPending = createColumn.isPending || updateColumn.isPending;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = columnFormSchema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Nombre inválido");
      return;
    }
    if (column) {
      updateColumn.mutate(
        { id: column._id, ...result.data },
        { onSuccess: onDone },
      );
    } else {
      createColumn.mutate(result.data, { onSuccess: onDone });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6">
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="column-name">Nombre</FieldLabel>
        <Input
          id="column-name"
          autoFocus
          value={name}
          maxLength={200}
          aria-invalid={!!error}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
        />
        <FieldError>{error}</FieldError>
      </Field>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={isPending} />}>
          Cancelar
        </DialogClose>
        <Button
          type="submit"
          disabled={isPending || (!!column && name.trim() === column.name)}
        >
          {isPending && <Spinner />}
          {column ? "Guardar" : "Crear"}
        </Button>
      </DialogFooter>
    </form>
  );
};
