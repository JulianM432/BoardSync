import { Schema, Types, model, HydratedDocument } from "mongoose";

export interface IColumn {
  name: string;
  boardId: Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ColumnDocument = HydratedDocument<IColumn>;

const columnSchema = new Schema<IColumn>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    position: { type: Number, required: true },
  },
  { timestamps: true },
);

columnSchema.index({ boardId: 1, position: 1 });
columnSchema.index({ boardId: 1, name: 1 }, { unique: true });

export const ColumnModel = model<IColumn>("Column", columnSchema);
