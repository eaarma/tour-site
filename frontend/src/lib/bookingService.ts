import api from "./api/axios";

const BASE_URL = "/public/orders";

export const BookingService = {
  validateToken: async (token: string): Promise<void> => {
    await api.get(`${BASE_URL}/manage`, {
      params: { token },
    });
  },
};
