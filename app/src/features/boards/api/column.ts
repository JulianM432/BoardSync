import { apiClient } from "@/lib/axios-config";
import type { ColumnDTO } from "@/schemas/board";

export type ColumnInput = {
  name: string;
};

export const columnAPI = {
  getColumns: async (boardId: string): Promise<ColumnDTO[]> => {
    const { data } = await apiClient.get(`/boards/${boardId}/columns`);
    return data;
  },
  createColumn: async (
    boardId: string,
    input: ColumnInput,
  ): Promise<ColumnDTO> => {
    const { data } = await apiClient.post(`/boards/${boardId}/columns`, input);
    return data;
  },
  updateColumn: async (
    boardId: string,
    id: string,
    input: ColumnInput,
  ): Promise<ColumnDTO> => {
    const { data } = await apiClient.patch(
      `/boards/${boardId}/columns/${id}`,
      input,
    );
    return data;
  },
  deleteColumn: async (boardId: string, id: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/columns/${id}`);
  },
};
