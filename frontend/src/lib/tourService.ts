import { TourCreateDto, Item } from "@/types";
import api from "./axios";

const BASE_URL = "/tours";

export const TourService = {
  getAll: async (): Promise<Item[]> => {
    const res = await api.get(BASE_URL);
    return res.data;
  },

  getById: async (id: number): Promise<Item> => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (data: TourCreateDto): Promise<Item> => {
    const res = await api.post(BASE_URL, data);
    return res.data;
  },

  update: async (id: number, data: TourCreateDto): Promise<Item> => {
    const res = await api.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },
};
