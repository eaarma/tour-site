export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface PaymentLineResponseDto {
  id: number;

  paymentId: number;
  orderItemId: number;
  orderId: number;

  shopId: number;

  grossAmount: number;
  platformFee: number;
  shopAmount: number;

  currency: string;
  status: PaymentStatus;

  createdAt: string;
}
