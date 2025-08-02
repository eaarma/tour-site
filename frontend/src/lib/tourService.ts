import api from "./axios";
import { TourCreateDto, TourResponseDto } from "@/types/tour";

const BASE_URL = "/tours";

export const TourService = {
  getAll: async (): Promise<TourResponseDto[]> => {
    const res = await api.get(BASE_URL);
    return res.data;
  },

  getById: async (id: number): Promise<TourResponseDto> => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (data: TourCreateDto): Promise<TourResponseDto> => {
    const res = await api.post(BASE_URL, data);
    return res.data;
  },

  update: async (id: number, data: TourCreateDto): Promise<TourResponseDto> => {
    const res = await api.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },
};
