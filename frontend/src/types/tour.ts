export interface TourCreateDto {
  title: string;
  description: string;
  image: string;
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

export interface Item {
  id: number;
  title: string;
  description: string;
  image: string;
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
