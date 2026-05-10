import {
  PublicShopUserDto,
  ShopMembershipDto,
  ShopUserDto,
  ShopUserStatusDto,
} from "@/types";
import api from "@/lib/api/axios";

const BASE_URL = "/api/shop-users";

export const ShopUserService = {
  getUsersForShop: async (shopId: number): Promise<ShopUserDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}`);
    return res.data;
  },

  getActiveUsersForShop: async (shopId: number): Promise<ShopUserDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}/active`);
    return res.data;
  },

  getPublicActiveUsersForShop: async (
    shopId: number,
  ): Promise<PublicShopUserDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}/active/public`);
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

  // Update a user role.
  updateRole: async (
    shopId: number,
    userId: string,
    role: string
  ): Promise<void> => {
    await api.patch(`${BASE_URL}/${shopId}/${userId}/role?role=${role}`);
  },

  requestJoinShop: async (shopId: number): Promise<void> => {
    await api.post(`${BASE_URL}/shop/${shopId}/request`);
  },

  getMembership: async (shopId: number): Promise<ShopMembershipDto> => {
    const res = await api.get(`${BASE_URL}/membership/${shopId}`);
    return res.data;
  },
};

