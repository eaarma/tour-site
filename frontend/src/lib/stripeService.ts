import { PaymentResponseDto } from "@/types/payment";
import api from "./api/axios";

export const StripeService = {
  createIntent: async (orderId: number): Promise<string> => {
    const res = await api.post(`/checkout/stripe/intent/${orderId}`);
    return res.data; // clientSecret
  },

  getPaymentStatus: async (orderId: number): Promise<PaymentResponseDto> => {
    const res = await api.get(`/payments/order/${orderId}`);
    return res.data;
  },
};
