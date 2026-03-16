export type PaymentStatus =
  | "PAID"
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentLineType = "SALE" | "REFUND" | "CANCELLATION_FEE";

export interface PaymentLineResponseDto {
  id: number;

  paymentId: number;
  orderItemId: number;
  orderId: number;

  shopId: number;

  type: PaymentLineType;

  sessionId: number | null;

  grossAmount: number;
  platformFee: number;
  shopAmount: number;

  currency: string;
  status: PaymentStatus;

  createdAt: string;
}
