import api from "@/lib/api/axios";
import { UserResponseDto } from "@/types/user";

const BASE_URL = "/api/users";

export const UserService = {
  getProfile: async (): Promise<UserResponseDto> => {
    const res = await api.get(`${BASE_URL}/me`);
    return res.data;
  },

  updateProfile: async (
    data: Partial<UserResponseDto>,
  ): Promise<UserResponseDto> => {
    const res = await api.put(`${BASE_URL}/me`, data);
    return res.data;
  },

  getById: async (id: string): Promise<UserResponseDto> => {
    const res = await api.get(`/api/users/${id}`);
    return res.data;
  },

  getAll: async (params?: {
    query?: string;
    status?: "ACTIVE" | "REMOVED";
    page?: number;
    size?: number;
  }) => {
    const res = await api.get(BASE_URL, { params });
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/remove`);
  },

  updateRole: async (id: string, role: string): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/role`, null, {
      params: { role },
    });
  },
};
