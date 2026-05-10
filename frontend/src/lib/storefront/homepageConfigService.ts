import api from "@/lib/api/axios";
import type {
  HomepageConfigDto,
  UpdateHomepageConfigRequestDto,
} from "@/types/homepage";

const BASE_URL = "/storefront/homepage";

export const HomepageConfigService = {
  get: async (): Promise<HomepageConfigDto> => {
    const response = await api.get(BASE_URL, { withCredentials: false });
    return response.data;
  },

  update: async (
    data: UpdateHomepageConfigRequestDto,
  ): Promise<HomepageConfigDto> => {
    const response = await api.put(BASE_URL, data);
    return response.data;
  },
};
