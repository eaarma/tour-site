import api from "@/lib/api/axios";
import type {
  StorefrontSettingsDto,
  UpdateStorefrontSettingsRequestDto,
} from "@/types/storefront";

const BASE_URL = "/storefront";

export const StorefrontService = {
  get: async (): Promise<StorefrontSettingsDto> => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  update: async (
    data: UpdateStorefrontSettingsRequestDto,
  ): Promise<StorefrontSettingsDto> => {
    const response = await api.put(BASE_URL, data);
    return response.data;
  },
};
