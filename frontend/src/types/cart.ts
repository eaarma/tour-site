export interface CartItemDto {
  tourId: number;
  participants: number;
  selectedDate: string; // assumed to be ISO string
  preferredLanguage?: string;
  comment?: string;
}

export interface CartItem {
  cartItemId: string;
  id: string;
  title: string;
  price: number;
  participants: number;
  scheduleId: number;
  selectedDate: string;
  selectedTime: string;
  selected: boolean;
  images?: string[];
  availableLanguages?: string[];
  preferredLanguage?: string;
  comment?: string;
}
