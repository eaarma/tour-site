import api from "@/lib/api/axios";

const BASE_URL = "/manager/sessions";

export const SessionCancellationService = {
  cancelSession: async (sessionId: number): Promise<void> => {
    await api.post(
      `${BASE_URL}/${sessionId}/cancel`,
      {},
      {
        withCredentials: true,
      },
    );
  },
};

