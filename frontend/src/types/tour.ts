export interface TourCreateDto {
  title: string;
  description: string;
  images?: string[];
  price: number; // BigDecimal in Java becomes number in TS
  timeRequired: number;
  intensity: string;
  participants: number;
  category: string;
  language: string;
  type: string;
  location: string;
  status: string;
  shopId: number; // Long in Java -> number in TS
}

export interface Tour {
  id: number;
  title: string;
  description: string;
  images?: string[];
  price: number;
  timeRequired: number;
  intensity: string;
  participants: number;
  category: string;
  language: string;
  type: string;
  location: string;
  status: string;
  madeBy: string;
  shopId: number;
}

export interface TourImage {
  id: number;
  imageUrl: string;
  position: number;
  uploadedAt: string;
}
