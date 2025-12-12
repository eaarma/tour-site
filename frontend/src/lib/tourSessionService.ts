import api from "@/lib/api/axios";
import { SessionStatus, TourSessionDto } from "@/types/tourSession";

export const TourSessionService = {
  // Get all sessions for a given tour
  getByTour: async (tourId: number): Promise<TourSessionDto[]> => {
    const res = await api.get(`/api/sessions/tour/${tourId}`);
    return res.data;
  },

  // Get a single session (full details incl. participants)
  getById: async (sessionId: number): Promise<TourSessionDto> => {
    const res = await api.get(`/api/sessions/${sessionId}`);
    return res.data;
  },

  updateStatus: async (
    sessionId: number,
    status: SessionStatus
  ): Promise<TourSessionDto> => {
    const res = await api.patch<TourSessionDto>(
      `/api/sessions/${sessionId}/status`,
      null,
      { params: { status } }
    );
    return res.data; // ⬅️ important
  },

  assignManager: async (
    sessionId: number,
    managerId: string | null
  ): Promise<TourSessionDto> => {
    // ✅ unassign: don't send the param at all
    if (!managerId) {
      const res = await api.patch<TourSessionDto>(
        `/sessions/${sessionId}/assign-manager`,
        null
      );
      return res.data;
    }

    // ✅ assign: send managerId
    const res = await api.patch<TourSessionDto>(
      `/api/sessions/${sessionId}/assign-manager`,
      null,
      { params: { managerId } }
    );
    return res.data;
  },

  getByShopId: (shopId: number) =>
    api.get(`/api/sessions/shop/${shopId}`).then((res) => res.data),

  async getByManagerId(managerId: string) {
    const res = await api.get<TourSessionDto[]>(
      `/api/sessions/manager/${managerId}`
    );
    return res.data;
  },
};
