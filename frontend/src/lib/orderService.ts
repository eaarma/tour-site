import api from "./axios";
import { OrderCreateRequestDto, OrderResponseDto } from "@/types/order";

const BASE_URL = "/orders";

export const OrderService = {
  getById: async (id: string): Promise<OrderResponseDto> => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (data: OrderCreateRequestDto): Promise<OrderResponseDto> => {
    const res = await api.post(BASE_URL, data);
    return res.data;
  },

  update: async (
    id: string,
    data: OrderCreateRequestDto
  ): Promise<OrderResponseDto> => {
    const res = await api.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },
};
