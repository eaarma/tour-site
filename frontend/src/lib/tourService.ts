import { TourCreateDto, Item } from "@/types";
import api from "./axios";

const BASE_URL = "/tours";

export const TourService = {
  getAll: async (): Promise<Item[]> => {
    const res = await api.get(BASE_URL, { withCredentials: false });
    return res.data;
  },

  getById: async (id: number): Promise<Item> => {
    const res = await api.get(`${BASE_URL}/${id}`, { withCredentials: false });
    return res.data;
  },

  create: async (data: TourCreateDto): Promise<Item> => {
    const res = await api.post(BASE_URL, data, { withCredentials: true });
    return res.data;
  },

  update: async (id: number, data: TourCreateDto): Promise<Item> => {
    const res = await api.put(`${BASE_URL}/${id}`, data, {
      withCredentials: true,
    });
    return res.data;
  },

  // get tours by shop
  getByShopId: async (shopId: number): Promise<Item[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}`);
    return res.data;
  },
};
