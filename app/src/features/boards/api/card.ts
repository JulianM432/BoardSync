import { apiClient } from "@/lib/axios-config";
import type { CardDTO } from "@/schemas/board";

type CreateCardInput = {
  title: string;
  description?: string;
  columnId: string;
};

type UpdateCardInput = {
  title?: string;
  description?: string;
};

export const cardAPI = {
  getCards: async (boardId: string): Promise<CardDTO[]> => {
    const { data } = await apiClient.get(`/boards/${boardId}/cards`);
    return data;
  },
  createCard: async (boardId: string, input: CreateCardInput) => {
    const { data } = await apiClient.post(`/boards/${boardId}/cards`, input);
    return data;
  },
  updateCard: async (boardId: string, id: string, input: UpdateCardInput) => {
    const { data } = await apiClient.patch(
      `/boards/${boardId}/cards/${id}`,
      input,
    );
    return data;
  },
  deleteCard: async (boardId: string, id: string) => {
    const { data } = await apiClient.delete(`/boards/${boardId}/cards/${id}`);
    return data;
  },
};
