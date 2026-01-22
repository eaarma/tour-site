import api from "@/lib/api/axios"; // for authenticated requests
import { TourImage } from "@/types/tour";

export const TourImageService = {
  // ✅ Fetch all images for a tour
  getImages: async (tourId: number): Promise<TourImage[]> => {
    const res = await api.get(`/api/tours/${tourId}/images`);
    return res.data;
  },

  // ✅ Add a new image (after uploading to Firebase)
  addImage: async (tourId: number, imageUrl: string): Promise<TourImage> => {
    const res = await api.post(`/api/tours/${tourId}/images`, {
      imageUrl,
    });
    return res.data;
  },

  // ✅ Delete image by imageId
  deleteImage: async (tourId: number, imageId: number): Promise<void> => {
    await api.delete(`/api/tours/${tourId}/images/${imageId}`);
  },

  updateOrder: async (tourId: number, imageIds: number[]) => {
    await api.put(`/api/tours/${tourId}/images/reorder`, imageIds);
  },
};
