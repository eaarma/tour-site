import api from "./api/axios";
import { PaymentResponseDto } from "@/types/payment";

const BASE_URL = "/payments";

export const PaymentService = {
  // 🔹 Get payment by ID
  getById: async (id: number): Promise<PaymentResponseDto> => {
    const res = await api.get(`${BASE_URL}/${id}`, {
      withCredentials: true,
    });
    return res.data;
  },

  // 🔹 Get payment by order ID
  getByOrderId: async (orderId: number): Promise<PaymentResponseDto> => {
    const res = await api.get(`${BASE_URL}/order/${orderId}`, {
      withCredentials: true,
    });
    return res.data;
  },

  // 🔹 Get payments for a shop (manager dashboard)
  getByShopId: async (shopId: number): Promise<PaymentResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}`, {
      withCredentials: true,
    });
    return res.data;
  },
};
