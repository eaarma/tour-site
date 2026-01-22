export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "CANCELLED_CONFIRMED";

export interface OrderItemCreateRequestDto {
  tourId: number;
  scheduledAt: string; // LocalDateTime → ISO string
  participants: number;
  preferredLanguage?: string;
  comment?: string;
}

export interface OrderCreateRequestDto {
  items: OrderItemCreateRequestDto[];
  paymentMethod: string;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
}

export interface OrderItemResponseDto {
  id: number;
  tourId: number;
  shopId: number;
  tourTitle: string;
  scheduledAt: string;
  participants: number;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
  pricePaid: number;
  status: OrderStatus;
  createdAt: string;
  tourSnapshot?: string;
  managerId?: string;
  managerName?: string;
  preferredLanguage?: string;
  comment?: string;
}

export interface OrderResponseDto {
  id: number;
  totalPrice: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponseDto[];
}

export interface OrderItem {
  tourTitle: string;
  scheduledAt: string;
  participants: number;
  pricePaid: number;
  preferredLanguage: string;
  comment?: string;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
}

export interface Order {
  id: number | string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
}

export interface OrderItemCardDto {
  id: number;
  name: string;
  participants: number;
  status: OrderStatus;
  tourTitle: string;
  scheduledAt: string;
  pricePaid: number;
  managerId?: string;
  managerName?: string;
}

export interface OrderDetailsModalDto {
  id: number;
  scheduledAt: string;

  name: string;
  participants: number;
  status: OrderStatus;
  pricePaid: number;

  email: string;
  phone: string;
  nationality?: string | null;

  managerId?: string;
  managerName?: string;
}
