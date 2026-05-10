import api from "@/lib/api/axios";
import type {
  StorePageDto,
  StorePageSlug,
  UpdateStorePageRequestDto,
} from "@/types/storePage";

const BASE_URL = "/storefront/pages";

export const StorePageService = {
  getPages: async (): Promise<StorePageDto[]> => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  getPage: async (slug: StorePageSlug): Promise<StorePageDto> => {
    const response = await api.get(`${BASE_URL}/${slug}`, {
      withCredentials: false,
    });
    return response.data;
  },

  updatePage: async (
    slug: StorePageSlug,
    data: UpdateStorePageRequestDto,
  ): Promise<StorePageDto> => {
    const response = await api.put(`${BASE_URL}/${slug}`, data);
    return response.data;
  },
};
