import {
  TourScheduleCreateDto,
  TourScheduleResponseDto,
  TourScheduleUpdateDto,
} from "@/types/tourSchedule";
import api from "./api/axios";
const BASE_URL = "/schedules";

export const TourScheduleService = {
  // Create new schedule
  create: async (
    data: TourScheduleCreateDto,
  ): Promise<TourScheduleResponseDto> => {
    const res = await api.post(BASE_URL, data);
    return res.data;
  },

  // Get all schedules for a given tour
  getByTourId: async (tourId: number): Promise<TourScheduleResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/tour/${tourId}`);
    return res.data;
  },

  // Get schedule by id
  getById: async (id: number): Promise<TourScheduleResponseDto> => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  // Update schedule
  update: async (
    id: number,
    data: TourScheduleUpdateDto,
  ): Promise<TourScheduleResponseDto> => {
    const res = await api.patch(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  // Delete schedule
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
