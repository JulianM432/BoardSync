import { useState, type KeyboardEvent, type SubmitEvent } from "react";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCard,
  useUpdateCard,
} from "@/features/boards/hooks/useCardMutations";
import {
  CARD_TITLE_MAX,
  cardFormSchema,
  type CardDTO,
  type CardFormValues,
  type UserRef,
} from "@/schemas/board";

type CardFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  columnId: string;
  assignees: UserRef[];
  card?: CardDTO;
};

export const CardFormDialog = ({
  open,
  onOpenChange,
  ...formProps
}: CardFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {formProps.card ? "Editar tarjeta" : "Nueva tarjeta"}
          </DialogTitle>
        </DialogHeader>
        <CardForm {...formProps} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

type CardFormProps = Omit<CardFormDialogProps, "open" | "onOpenChange"> & {
  onDone: () => void;
};

const toFormValues = (card?: CardDTO): CardFormValues => ({
  title: card?.title ?? "",
  description: card?.description ?? "",
  assignedTo: card?.assignedTo?._id ?? null,
});

const submitOnCtrlEnter = (e: KeyboardEvent<HTMLFormElement>) => {
  if (
    e.key === "Enter" &&
    (e.ctrlKey || e.metaKey) &&
    e.target instanceof HTMLTextAreaElement
  ) {
    e.currentTarget.requestSubmit();
  }
};

const CardForm = ({
  boardId,
  columnId,
  assignees,
  card,
  onDone,
}: CardFormProps) => {
  const initialValues = toFormValues(card);
  const [values, setValues] = useState(initialValues);
  const [titleError, setTitleError] = useState<string | null>(null);
  const createCard = useCreateCard(boardId);
  const updateCard = useUpdateCard(boardId);
  const isPending = createCard.isPending || updateCard.isPending;

  const isDirty =
    values.title.trim() !== initialValues.title ||
    values.description.trim() !== initialValues.description ||
    values.assignedTo !== initialValues.assignedTo;

  const assigneeItems = [
    { value: null, label: "Sin asignar" },
    ...assignees.map((user) => ({ value: user._id, label: user.username })),
  ];

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = cardFormSchema.safeParse(values);
    if (!result.success) {
      setTitleError(result.error.issues[0]?.message ?? "Título inválido");
      return;
    }
    if (card) {
      updateCard.mutate(
        { id: card._id, ...result.data },
        { onSuccess: onDone },
      );
    } else {
      createCard.mutate({ ...result.data, columnId }, { onSuccess: onDone });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={submitOnCtrlEnter}
      noValidate
      className="grid gap-6"
    >
      <FieldGroup>
        <Field data-invalid={!!titleError}>
          <FieldLabel htmlFor="card-title">Título</FieldLabel>
          <Input
            id="card-title"
            autoFocus
            value={values.title}
            maxLength={CARD_TITLE_MAX}
            placeholder="¿Qué hay que hacer?"
            aria-invalid={!!titleError}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, title: e.target.value }));
              setTitleError(null);
            }}
          />
          <FieldDescription>
            {values.title.length}/{CARD_TITLE_MAX}
          </FieldDescription>
          <FieldError>{titleError}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="card-description">Descripción</FieldLabel>
          <Textarea
            id="card-description"
            rows={4}
            value={values.description}
            placeholder="Detalles opcionales..."
            onChange={(e) =>
              setValues((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="card-assignee">Asignada a</FieldLabel>
          <Select
            items={assigneeItems}
            value={values.assignedTo}
            onValueChange={(assignedTo) =>
              setValues((prev) => ({ ...prev, assignedTo }))
            }
          >
            <SelectTrigger id="card-assignee" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assigneeItems.map((item) => (
                <SelectItem key={item.value ?? "none"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={isPending} />}>
          Cancelar
        </DialogClose>
        <Button type="submit" disabled={isPending || (!!card && !isDirty)}>
          {isPending && <Spinner />}
          {card ? "Guardar" : "Crear"}
        </Button>
      </DialogFooter>
    </form>
  );
};
