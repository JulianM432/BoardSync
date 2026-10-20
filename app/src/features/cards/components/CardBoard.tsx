import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EllipsisVertical } from "lucide-react";

type CardProps = {
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date | string;
  canEdit: boolean;
};

const parseText = (value?: string | null) => value || "-";

const formatDate = (value: Date | string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-AR");
};

export const CardBoard = ({
  title,
  description,
  createdBy,
  createdAt,
  canEdit,
}: CardProps) => {
  return (
    <Card size="sm" className="w-full">
      <CardHeader>
        <CardTitle>{parseText(title)}</CardTitle>
        <CardDescription>{parseText(description)}</CardDescription>
        {canEdit && (
          <CardAction>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Opciones de ${title}`}
            >
              <EllipsisVertical />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <Separator />
      <CardFooter className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <p className="truncate">Creado por: {parseText(createdBy)}</p>
        <p className="shrink-0">{formatDate(createdAt)}</p>
      </CardFooter>
    </Card>
  );
};