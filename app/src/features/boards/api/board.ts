import { apiClient } from "@/lib/axios-config";
import type { BoardDTO } from "@/schemas/board";

type Role = "owner" | "editor" | "viewer";

type Member = {
  userId: string;
  role: Role;
};

type BoardInput = {
  name: string;
  members: Member[];
};

export const boardApi = {
  getBoards: async (): Promise<BoardDTO[]> => {
    const { data } = await apiClient.get("/boards");
    return data;
  },
  getBoardById: async (boardId: string): Promise<BoardDTO> => {
    const { data } = await apiClient.get(`/boards/${boardId}`);
    return data;
  },
  createBoard: async (input: BoardInput): Promise<BoardDTO> => {
    const { data } = await apiClient.post("/boards", input);
    return data;
  },
  updateBoard: async (
    boardId: string,
    input: BoardInput,
  ): Promise<BoardDTO> => {
    const { data } = await apiClient.patch(`/boards/${boardId}`, input);
    return data;
  },
  deleteBoard: async (boardId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}`);
  },
};
