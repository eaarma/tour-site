import api from "./api/axios";
import { CancelBookingResponseDto, OrderResponseDto } from "@/types/order";

const BASE_URL = "/public/orders";

export const BookingService = {
  getByToken: async (token: string): Promise<OrderResponseDto> => {
    const res = await api.get(`${BASE_URL}/manage`, {
      params: { token },
    });
    return res.data;
  },

  cancelItem: async (
    token: string,
    orderItemId: number,
    reason?: string,
  ): Promise<CancelBookingResponseDto> => {
    const res = await api.post(`${BASE_URL}/items/${orderItemId}/cancel`, {
      token,
      reason,
    });
    return res.data;
  },
};
