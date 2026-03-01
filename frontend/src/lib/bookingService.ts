import api from "./api/axios";
import { OrderResponseDto } from "@/types/order";

const BASE_URL = "/public/orders";

export const BookingService = {
  getByToken: async (token: string): Promise<OrderResponseDto> => {
    const res = await api.get(`${BASE_URL}/manage`, {
      params: { token },
    });
    return res.data;
  },
};
