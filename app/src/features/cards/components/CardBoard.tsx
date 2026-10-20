import { ActionsMenu } from "@/components/actions-menu";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CardDTO } from "@/schemas/board";

type CardActions = {
  onEdit: () => void;
  onDelete: () => void;
};

type CardProps = {
  card: CardDTO;
  actions?: CardActions;
  className?: string;
};

const parseText = (value?: string | null) => value || "-";

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-AR");
};

export const CardBoard = ({ card, actions, className }: CardProps) => {
  const wasEdited = card.updatedAt !== card.createdAt;

  return (
    <Card size="sm" className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{parseText(card.title)}</CardTitle>
        <CardDescription>{parseText(card.description)}</CardDescription>
        {actions && (
          <CardAction>
            <ActionsMenu
              label={`Opciones de ${card.title}`}
              onEdit={actions.onEdit}
              onDelete={actions.onDelete}
            />
          </CardAction>
        )}
      </CardHeader>
      <Separator />
      <CardFooter className="flex flex-col items-stretch gap-1 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate">
            Asignada a: {parseText(card.assignedTo?.username)}
          </p>
          <p className="shrink-0">{formatDate(card.createdAt)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate">
            Creada por: {parseText(card.createdBy.username)}
          </p>
          {wasEdited && (
            <p className="shrink-0">Editada {formatDate(card.updatedAt)}</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
