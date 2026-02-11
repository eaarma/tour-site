import api from "./api/axios";
import { PaymentLineResponseDto } from "@/types/paymentLine";

const BASE_URL = "/payments";

export const PaymentLineService = {
  getByShopId: async (shopId: number): Promise<PaymentLineResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}`, {
      withCredentials: true,
    });
    return res.data;
  },
};
