import api from "./api/axios";
import { PaymentLineResponseDto } from "@/types/paymentLine";

const BASE_URL = "/payments";

export interface PaymentLinePageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

interface AdminPaymentLineParams {
  query?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const PaymentLineService = {
  getByShopId: async (shopId: number): Promise<PaymentLineResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}`, {
      withCredentials: true,
    });
    return res.data;
  },

  getAdminPage: async (
    params?: AdminPaymentLineParams,
  ): Promise<PaymentLinePageResponse<PaymentLineResponseDto>> => {
    const res = await api.get(`${BASE_URL}/admin`, {
      params,
      withCredentials: true,
    });

    return res.data;
  },
};
