import { apiClient } from "@/lib/axios-config";

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
  getBoards: async () => {
    const { data } = await apiClient.get("/boards");
    return data;
  },
  getBoardById: async (boardId: string) => {
    const { data } = await apiClient.get(`/boards/${boardId}`);
    return data;
  },
  createBoard: async (input: BoardInput) => {
    const { data } = await apiClient.post("/boards", input);
    return data;
  },
  updateBoard: async (boardId: string, input: BoardInput) => {
    const { data } = await apiClient.patch(`/boards/${boardId}`, input);
    return data;
  },
  deleteBoard: async (boardId: string) => {
    const { data } = await apiClient.delete(`/boards/${boardId}`);
    return data;
  },
};
