import { ShopUserDto, ShopUserStatusDto } from "@/types";
import api from "./axios";

const BASE_URL = "/api/shop-users";

export const ShopUserService = {
  getUsersForShop: async (shopId: number): Promise<ShopUserDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}`);
    return res.data;
  },

  getShopsForCurrentUser: async (): Promise<ShopUserStatusDto[]> => {
    const res = await api.get(`${BASE_URL}/user/me`);
    return res.data;
  },

  addUserToShop: async (
    shopId: number,
    userId: string,
    role: string
  ): Promise<void> => {
    await api.post(`${BASE_URL}/${shopId}/${userId}?role=${role}`);
  },

  updateStatus: async (
    shopId: number,
    userId: string,
    status: string
  ): Promise<void> => {
    await api.patch(`${BASE_URL}/${shopId}/${userId}/status?status=${status}`);
  },

  requestJoinShop: async (shopId: number): Promise<void> => {
    await api.post(`${BASE_URL}/shop/${shopId}/request`);
  },
};
