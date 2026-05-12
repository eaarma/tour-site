import api from "@/lib/api/axios";
import { ShopDto, ShopCreateRequestDto } from "@/types/shop";

const BASE_URL = "/shops";

type ShopStatus = "ACTIVE" | "DISABLED" | "REMOVED";

type ShopStatusUpdatePayload = {
  status: ShopStatus;
  statusReason?: string;
};
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

export const ShopService = {
  getAll: async (params?: {
    query?: string;
    status?: "ACTIVE" | "REMOVED" | "DISABLED";
    page?: number;
    size?: number;
  }): Promise<PageResponse<ShopDto>> => {
    const res = await api.get(BASE_URL, { params });
    return res.data;
  },

  getById: async (id: number): Promise<ShopDto> => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (data: ShopCreateRequestDto): Promise<ShopDto> => {
    const res = await api.post(BASE_URL, data);
    return res.data;
  },

  update: async (
    shopId: number,
    data: ShopCreateRequestDto,
  ): Promise<ShopDto> => {
    const res = await api.put(`${BASE_URL}/${shopId}`, data);
    return res.data;
  },

  setStatus: async (
    id: number,
    payload: ShopStatusUpdatePayload,
  ): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/status`, payload);
  },
};
