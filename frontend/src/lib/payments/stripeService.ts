import { PaymentResponseDto } from "@/types/payment";
import api from "@/lib/api/axios";

export const StripeService = {
  createIntent: async (orderId: number, token?: string): Promise<string> => {
    const url = token
      ? `/checkout/stripe/intent/${orderId}?token=${encodeURIComponent(token)}`
      : `/checkout/stripe/intent/${orderId}`;

    const res = await api.post(url);
    return res.data; // clientSecret
  },

  getPaymentStatus: async (
    orderId: number,
    token?: string,
  ): Promise<PaymentResponseDto> => {
    const url = token
      ? `/public/payments/order/${orderId}?token=${encodeURIComponent(token)}`
      : `/payments/order/${orderId}`;

    const res = await api.get(url);
    return res.data;
  },
};

