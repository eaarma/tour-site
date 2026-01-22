export interface TourCreateDto {
  title: string;
  description: string;
  images?: string[];
  price: number; // BigDecimal in Java becomes number in TS
  timeRequired: number;
  intensity: string;
  participants: number;
  categories: TourCategory[];
  language: string[];
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
  categories: TourCategory[];
  language: string[];
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

export type TourCategory =
  | "WALKING"
  | "CYCLING"
  | "HIKING"
  | "BUS"
  | "BOAT"
  | "CAR"
  | "SIGHTSEEING"
  | "CITY_TOUR"
  | "ISLAND"
  | "WORKSHOP"
  | "BOAT_CRUISE"
  | "ADVENTURE"
  | "HISTORY"
  | "CULTURE"
  | "ART"
  | "RELIGION"
  | "NATURE"
  | "WILDLIFE"
  | "FOOD"
  | "WINE"
  | "PHOTOGRAPHY"
  | "MUSIC"
  | "NIGHTLIFE"
  | "FESTIVAL"
  | "SLOW_PACED"
  | "INTENSE"
  | "BUDGET";

// src/types/ItemModalItem.ts
export interface ItemModalItem {
  id: number;
  title: string;
  price: number;
  participants: number;
  images?: string[];
  status: string;
  timeRequired: number;
  language: string[];
}

// types/tour/TourFormDto.ts
// types/tour/TourFormDto.ts

export interface TourFormDto {
  shopId?: number;
  title?: string;
  description?: string;
  location?: string;
  images?: string[];
  price?: number;
  timeRequired?: number;
  intensity?: string;
  participants?: number;

  categories?: TourCategory[];
  language?: string[];

  type?: string;
  status?: string;
}

// types/tour/TourUpdateDto.ts
export interface TourUpdateDto {
  title: string;
  description: string;
  images: string[];
  price: number;
  timeRequired: number;
  intensity: string;
  participants: number;
  categories: string[];
  language: string[];
  type: string;
  location: string;
  status: string;
  shopId: number;
}
