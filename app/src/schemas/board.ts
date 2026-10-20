import { z } from "zod";

export const MEMBER_ROLES = ["editor", "viewer"] as const;

export const columnFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, "Máximo 200 caracteres"),
});

export const CARD_TITLE_MAX = 200;

export const cardFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio")
    .max(CARD_TITLE_MAX, `Máximo ${CARD_TITLE_MAX} caracteres`),
  description: z.string().trim(),
  assignedTo: z.string().nullable(),
});

export const boardFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(200, "Máximo 200 caracteres"),
  members: z.array(
    z.object({
      userId: z.string(),
      role: z.enum(MEMBER_ROLES),
    }),
  ),
});

export type ColumnFormValues = z.infer<typeof columnFormSchema>;
export type CardFormValues = z.infer<typeof cardFormSchema>;
export type BoardFormValues = z.infer<typeof boardFormSchema>;

export type ColumnDTO = {
  _id: string;
  name: string;
  boardId: string;
  position: number;
};

export type UserRef = {
  _id: string;
  username: string;
};

export type CardDTO = {
  _id: string;
  title: string;
  description: string;
  boardId: string;
  columnId: string;
  createdBy: UserRef;
  assignedTo: UserRef | null;
  position: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardMemberDTO = {
  userId: UserRef;
  role: (typeof MEMBER_ROLES)[number];
};

export type BoardDTO = {
  _id: string;
  name: string;
  ownerId: UserRef;
  members: BoardMemberDTO[];
  createdAt: string;
  updatedAt: string;
};
