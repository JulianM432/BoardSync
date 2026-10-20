import { apiClient } from "@/lib/axios-config";
import type { CardDTO } from "@/schemas/board";

export type CreateCardInput = {
  title: string;
  description?: string;
  columnId: string;
  assignedTo?: string | null;
};

export type UpdateCardInput = {
  title?: string;
  description?: string;
  assignedTo?: string | null;
};

export const cardAPI = {
  getCards: async (boardId: string): Promise<CardDTO[]> => {
    const { data } = await apiClient.get(`/boards/${boardId}/cards`);
    return data;
  },
  createCard: async (
    boardId: string,
    input: CreateCardInput,
  ): Promise<CardDTO> => {
    const { data } = await apiClient.post(`/boards/${boardId}/cards`, input);
    return data;
  },
  updateCard: async (
    boardId: string,
    id: string,
    input: UpdateCardInput,
  ): Promise<CardDTO> => {
    const { data } = await apiClient.patch(
      `/boards/${boardId}/cards/${id}`,
      input,
    );
    return data;
  },
  deleteCard: async (boardId: string, id: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/cards/${id}`);
  },
};
