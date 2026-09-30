import { Schema, model, type Types, type HydratedDocument } from "mongoose";

export const MEMBER_ROLES = ["editor", "viewer"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export interface IBoardMember {
  userId: Types.ObjectId;
  role: MemberRole;
}

export interface IBoard {
  name: string;
  ownerId: Types.ObjectId;
  members: IBoardMember[];
  createdAt: Date;
  updatedAt: Date;
}

export type BoardDocument = HydratedDocument<IBoard>;

const memberSchema = new Schema<IBoardMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: MEMBER_ROLES, required: true },
  },
  { _id: false },
);

const boardSchema = new Schema<IBoard>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true },
);

boardSchema.index({ ownerId: 1 });
boardSchema.index({ "members.userId": 1 });
boardSchema.index({ ownerId: 1, name: 1 }, { unique: true });

export const BoardModel = model<IBoard>("Board", boardSchema);
