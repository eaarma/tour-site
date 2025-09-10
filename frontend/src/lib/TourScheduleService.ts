import api from "./axios";

export interface TourScheduleCreateDto {
  tourId: number;
  date: string; // format: YYYY-MM-DD
  time: string; // format: HH:mm
  maxParticipants: number;
}

export interface TourScheduleUpdateDto {
  date?: string;
  time?: string;
  maxParticipants?: number;
}

export interface TourScheduleResponseDto {
  id: number;
  date: string;
  time: string;
  maxParticipants: number;
  tourId: number;
}

const BASE_URL = "/schedules";

export const TourScheduleService = {
  // Create new schedule
  create: async (
    data: TourScheduleCreateDto
  ): Promise<TourScheduleResponseDto> => {
    const res = await api.post(BASE_URL, data);
    return res.data;
  },

  // Get all schedules for a given tour
  getByTourId: async (tourId: number): Promise<TourScheduleResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/tour/${tourId}`);
    return res.data;
  },

  // Update schedule
  update: async (
    id: number,
    data: TourScheduleUpdateDto
  ): Promise<TourScheduleResponseDto> => {
    const res = await api.patch(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  // Delete schedule
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
