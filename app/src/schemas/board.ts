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
  role: "editor" | "viewer";
};

export type BoardDTO = {
  _id: string;
  name: string;
  ownerId: UserRef;
  members: BoardMemberDTO[];
  createdAt: string;
  updatedAt: string;
};
