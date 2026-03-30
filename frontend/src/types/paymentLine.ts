export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentLineType =
  | "SALE"
  | "REFUND"
  | "CANCELLATION_FEE"
  | "PAYOUT"
  | "ADJUSTMENT";

export interface PaymentLineResponseDto {
  id: number;

  paymentId: number | null;
  orderItemId: number | null;
  orderId: number | null;

  shopId: number;

  tourTitle?: string | null;
  scheduledAt?: string | null;
  participants?: number | null;

  type: PaymentLineType;

  sessionId: number | null;

  grossAmount: number;
  platformFee: number;
  shopAmount: number;

  currency: string;
  status: PaymentStatus;

  createdAt: string;
}
