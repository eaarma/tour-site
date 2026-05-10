import api from "@/lib/api/axios";
import { SessionStatus, TourSessionDto } from "@/types/tourSession";

export interface SessionPageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

interface AdminSessionParams {
  query?: string;
  status?: SessionStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

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
    status: SessionStatus,
  ): Promise<TourSessionDto> => {
    const res = await api.patch<TourSessionDto>(
      `/api/sessions/${sessionId}/status`,
      null,
      { params: { status } },
    );
    return res.data; // Required for the service contract.
  },

  assignManager: async (
    sessionId: number,
    managerId: string | null,
  ): Promise<TourSessionDto> => {
    // Unassign by omitting the parameter entirely.
    if (!managerId) {
      const res = await api.patch<TourSessionDto>(
        `/api/sessions/${sessionId}/assign-manager`,
        null,
      );
      return res.data;
    }

    // Assign by sending managerId.
    const res = await api.patch<TourSessionDto>(
      `/api/sessions/${sessionId}/assign-manager`,
      null,
      { params: { managerId } },
    );
    return res.data;
  },

  getByShopId: (shopId: number): Promise<TourSessionDto[]> =>
    api.get(`/api/sessions/shop/${shopId}`).then((res) => res.data),

  async getByManagerId(managerId: string) {
    const res = await api.get<TourSessionDto[]>(
      `/api/sessions/manager/${managerId}`,
    );
    return res.data;
  },

  async getCompletedCount(shopId: number): Promise<number> {
    const res = await api.get<number>(
      `/api/sessions/shops/${shopId}/stats/tours-given`,
    );
    return res.data;
  },

  async getAdminPage(
    params?: AdminSessionParams,
  ): Promise<SessionPageResponse<TourSessionDto>> {
    const res = await api.get(`/api/sessions/admin`, {
      params,
      withCredentials: true,
    });

    return res.data;
  },
};
