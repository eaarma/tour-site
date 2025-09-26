export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface OrderItemResponseDto {
  id: number;
  tourId: number;
  shopId: number;
  tourTitle: string;
  scheduledAt: string; // LocalDateTime → ISO string
  participants: number;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
  pricePaid: number;
  status: OrderStatus;
  createdAt: string;
  tourSnapshot?: string;
}

export interface OrderResponseDto {
  id: number;
  totalPrice: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponseDto[]; // ✅ correct name
}
