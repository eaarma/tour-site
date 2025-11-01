import api from "@/lib/axios"; // for authenticated requests
import { TourImage } from "@/types/tour";

export const tourImageService = {
  // ✅ Fetch all images for a tour
  getImages: async (tourId: number): Promise<TourImage[]> => {
    const res = await api.get(`/tours/${tourId}/images`);
    return res.data;
  },

  // ✅ Add a new image (after uploading to Firebase)
  addImage: async (tourId: number, imageUrl: string): Promise<TourImage> => {
    const res = await api.post(`/tours/${tourId}/images`, {
      imageUrl,
    });
    return res.data;
  },

  // ✅ Delete image by imageId
  deleteImage: async (imageId: number): Promise<void> => {
    await api.delete(`/tours/images/${imageId}`);
  },
};
