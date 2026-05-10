import api from "@/lib/api/axios";
import {
  PayoutCreateRequestDto,
  PayoutResponseDto,
  PayoutSessionDetailsDto,
  PayoutSessionSummaryDto,
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

interface ManagerSessionSummaryParams {
  query?: string;
  status?: PayoutStatus;
  year?: number;
  month?: number;
}

interface ManagerSessionDetailsParams {
  sessionId: number;
  status?: PayoutStatus;
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

  async getManagerSessionSummaries(
    shopId: number,
    params?: ManagerSessionSummaryParams,
  ): Promise<PayoutSessionSummaryDto[]> {
    const res = await api.get(`/payouts/shops/${shopId}/sessions`, {
      params,
      withCredentials: true,
    });

    return res.data;
  },

  async getManagerSessionDetails(
    shopId: number,
    params: ManagerSessionDetailsParams,
  ): Promise<PayoutSessionDetailsDto> {
    const res = await api.get(`/payouts/shops/${shopId}/sessions/details`, {
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

