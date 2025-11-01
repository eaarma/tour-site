// handles fetching and updating profile info
import api from "@/lib/axios";
import { UserResponseDto } from "@/types/user";

const BASE_URL = "/api/users";

export const UserService = {
  getProfile: async (): Promise<UserResponseDto> => {
    const res = await api.get(`${BASE_URL}/me`);
    return res.data;
  },

  updateProfile: async (
    data: Partial<UserResponseDto>
  ): Promise<UserResponseDto> => {
    const res = await api.put(`${BASE_URL}/me`, data);
    return res.data;
  },

  getById: async (id: string): Promise<UserResponseDto> => {
    const res = await api.get(`/api/users/${id}`);
    return res.data;
  },
};
