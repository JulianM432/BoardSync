import { Schema, Types, model, HydratedDocument } from "mongoose";

export interface ICard {
  title: string;
  description: string;
  boardId: Types.ObjectId;
  columnId: Types.ObjectId;
  createdBy: Types.ObjectId;
  position: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CardDocument = HydratedDocument<ICard>;

const cardSchema = new Schema<ICard>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", trim: true },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    columnId: { type: Schema.Types.ObjectId, ref: "Column", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    position: { type: String, required: true },
  },
  { timestamps: true },
);

cardSchema.index({ columnId: 1, position: 1 });
cardSchema.index({ boardId: 1, columnId: 1, position: 1 });
cardSchema.index({ boardId: 1, columnId: 1, title: 1 }, { unique: true });

export const CardModel = model<ICard>("Card", cardSchema);
