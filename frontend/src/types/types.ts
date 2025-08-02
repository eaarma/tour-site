export interface Item {
  id: string;
  title: string;
  description: string;
  images: (File | string)[];
  price: string;
  timeRequired: string;
  participants: string;
  intensity: string;
  category: string;
  language: string;
  location: string;
}

export interface FilterCategory {
  key: string;
  label: string;
  options: string[];
}
