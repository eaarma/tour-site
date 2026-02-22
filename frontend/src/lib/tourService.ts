import { TourCreateDto, Tour, TourUpdateDto } from "@/types";
import api from "./api/axios";

const BASE_URL = "/tours";

// 🔹 Generic page response type from backend
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page index (0-based)
  size: number;
  first?: boolean;
  last?: boolean;
}

interface QueryParams {
  page?: number;
  size?: number;
  sort?: string; // e.g. "title,asc" or "price,desc"
  keyword?: string;
  date?: string;
  categories?: string[];
  language?: string[];
  type?: string[];
}

export const TourService = {
  getAll: async (): Promise<Tour[]> => {
    const res = await api.get(BASE_URL, { withCredentials: false });
    return res.data;
  },

  getById: async (id: number): Promise<Tour> => {
    const res = await api.get(`${BASE_URL}/${id}`, { withCredentials: false });
    return res.data;
  },

  create: async (data: TourCreateDto): Promise<Tour> => {
    const res = await api.post(BASE_URL, data, { withCredentials: true });
    return res.data;
  },

  update: async (id: number, data: TourUpdateDto): Promise<Tour> => {
    const res = await api.put(`${BASE_URL}/${id}`, data, {
      withCredentials: true,
    });
    return res.data;
  },

  // get tours by shop
  getByShopId: async (shopId: number): Promise<Tour[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}`);
    return res.data;
  },

  // 🔹 New: get tours with pagination, filtering, sorting
  getAllByQuery: async (params: QueryParams): Promise<PageResponse<Tour>> => {
    const res = await api.get(`${BASE_URL}/query`, {
      params,
      withCredentials: false,
    });
    return res.data;
  },

  // ✅ fetch random tours for horizontal list
  async getRandom(count: number = 8): Promise<Tour[]> {
    const res = await api.get(`${BASE_URL}/random`, {
      params: { count },
      withCredentials: false,
    });
    return res.data;
  },

  // ✅ fetch a single highlighted tour
  async getHighlighted(): Promise<Tour> {
    const res = await api.get(`${BASE_URL}/highlighted`, {
      withCredentials: false,
    });
    return res.data;
  },
};
