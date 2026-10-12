export type ColumnDTO = {
  _id: string;
  name: string;
  boardId: string;
  position: number;
};

export type CardDTO = {
  _id: string;
  title: string;
  description: string;
  boardId: string;
  columnId: string;
  createdBy: string;
  position: string;
  createdAt: string;
};
