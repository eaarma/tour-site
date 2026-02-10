import api from "./api/axios";
import {
  ReservationResponseDto,
  OrderResponseDto,
  OrderCreateRequestDto,
} from "@/types/order";

export const ReservationService = {
  reserve: async (
    data: OrderCreateRequestDto,
  ): Promise<ReservationResponseDto> => {
    const res = await api.post("/checkout/reserve", data);
    return res.data;
  },

  finalize: async (
    orderId: number,
    reservationToken: string,
  ): Promise<OrderResponseDto> => {
    const res = await api.post("/checkout/finalize", {
      orderId,
      reservationToken,
    });

    return res.data;
  },

  getStatus: async (
    orderId: number,
    reservationToken: string,
  ): Promise<OrderResponseDto> => {
    const res = await api.get(
      `/orders/status/${orderId}?token=${reservationToken}`,
    );

    return res.data;
  },
};
