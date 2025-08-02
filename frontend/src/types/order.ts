import { CheckoutDetailsDto } from "./checkout"; // assuming you'll define this next

export interface OrderCreateRequestDto {
  tourId: number;
  participants: number;
  scheduledAt: string; // LocalDateTime in Java → ISO string in TS
  checkoutDetails: CheckoutDetailsDto;
  paymentMethod: string;
}

export interface OrderResponseDto {
  id: string; // UUID as string
  tourId: number;
  participants: number;
  scheduledAt: string; // Instant as ISO string
  checkoutDetails: CheckoutDetailsDto;
  paymentMethod: string;
  pricePaid: number;
  status: OrderStatus;
  createdAt: string;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"; // extend based on enum
