import api from "./axios";
import { ShopDto, ShopCreateRequestDto } from "@/types/shop";

const BASE_URL = "/shops";

export const ShopService = {
  getAll: async (): Promise<ShopDto[]> => {
    const res = await api.get(BASE_URL);
    return res.data;
  },

  getById: async (id: number): Promise<ShopDto> => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (data: ShopCreateRequestDto): Promise<ShopDto> => {
    const res = await api.post(BASE_URL, data);
    return res.data;
  },

  update: async (
    shopId: number,
    data: ShopCreateRequestDto
  ): Promise<ShopDto> => {
    const res = await api.put(`${BASE_URL}/${shopId}`, data);
    return res.data;
  },
};
