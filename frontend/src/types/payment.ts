export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface PaymentResponseDto {
  id: number;

  orderId: number;

  providerPaymentId?: string;

  amountTotal: number;
  platformFee: number;
  shopAmount: number;

  currency: string;

  status: PaymentStatus;

  createdAt: string;
}

export interface PaymentDto {
  id: number;
  orderId: number;
  amountTotal: number;
  platformFee: number;
  shopAmount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface PaymentListResponseDto {
  payments: PaymentResponseDto[];
  total: number;
}
