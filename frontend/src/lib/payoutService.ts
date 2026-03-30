import api from "./api/axios";
import {
  PayoutCreateRequestDto,
  PayoutResponseDto,
  PayoutShopDetailsDto,
  PayoutShopSummaryDto,
  PayoutStatus,
} from "@/types/payout";

interface PayoutSummaryParams {
  query?: string;
  status?: PayoutStatus;
  year?: number;
  month?: number;
  from?: string;
  to?: string;
}

interface PayoutDetailsParams {
  status?: PayoutStatus;
  year?: number;
  month?: number;
  from?: string;
  to?: string;
}

const BASE_URL = "/payouts/admin";

export const PayoutService = {
  async getShopSummaries(
    params?: PayoutSummaryParams,
  ): Promise<PayoutShopSummaryDto[]> {
    const res = await api.get(`${BASE_URL}/shops`, {
      params,
      withCredentials: true,
    });

    return res.data;
  },

  async getShopDetails(
    shopId: number,
    params?: PayoutDetailsParams,
  ): Promise<PayoutShopDetailsDto> {
    const res = await api.get(`${BASE_URL}/shops/${shopId}`, {
      params,
      withCredentials: true,
    });

    return res.data;
  },

  async createPayout(
    data: PayoutCreateRequestDto,
  ): Promise<PayoutResponseDto> {
    const res = await api.post(BASE_URL, data, {
      withCredentials: true,
    });

    return res.data;
  },
};
