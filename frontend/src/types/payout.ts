export type PayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type PayoutMethod = "BANK_TRANSFER" | "CASH" | "OTHER";

export interface PayoutShopSummaryDto {
  shopId: number;
  shopName: string;
  bankAccountName: string | null;
  bankAccountIban: string | null;
  currency: string;
  status: PayoutStatus | null;
  payoutStatus: PayoutStatus | null;
  payoutId: number | null;
  payoutAmount: number | null;
  paidAt: string | null;
  payoutPeriodStart: string | null;
  payoutPeriodEnd: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  transactionCount: number;
  totalAmount: number;
}

export interface PayoutLineRowDto {
  paymentLineId: number;
  label: string;
  type: "SALE" | "REFUND" | "CANCELLATION_FEE" | "PAYOUT" | "ADJUSTMENT";
  orderId: number | null;
  orderItemId: number | null;
  sessionId: number | null;
  tourTitle: string;
  scheduledAt: string | null;
  participants: number | null;
  grossAmount: number;
  platformFee: number;
  shopAmount: number;
  currency: string;
  createdAt: string;
}

export interface PayoutSessionGroupDto {
  sessionId: number | null;
  sessionTitle: string;
  scheduledAt: string | null;
  transactionCount: number;
  totalAmount: number;
  rows: PayoutLineRowDto[];
}

export interface PayoutShopDetailsDto {
  shopId: number;
  shopName: string;
  bankAccountName: string | null;
  bankAccountIban: string | null;
  currency: string;
  payoutStatus: PayoutStatus | null;
  payoutId: number | null;
  payoutAmount: number | null;
  paidAt: string | null;
  payoutPeriodStart: string | null;
  payoutPeriodEnd: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  transactionCount: number;
  totalAmount: number;
  payouts: PayoutHistoryEntryDto[];
  sessionGroups: PayoutSessionGroupDto[];
}

export interface PayoutHistoryEntryDto {
  id: number;
  totalAmount: number;
  transactionCount: number;
  currency: string;
  status: PayoutStatus;
  method: PayoutMethod;
  reference: string | null;
  paidAt: string | null;
  createdAt: string;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface PayoutCreateRequestDto {
  shopId: number;
  periodStart: string;
  periodEnd: string;
  method: PayoutMethod;
  reference?: string;
  notes?: string;
  bankAccountName?: string;
  bankAccountIban?: string;
}

export interface PayoutResponseDto {
  id: number;
  shopId: number;
  totalAmount: number;
  transactionCount: number;
  currency: string;
  method: PayoutMethod;
  reference: string | null;
  notes: string | null;
  status: PayoutStatus;
  bankAccountName: string | null;
  bankAccountIban: string | null;
  paidAt: string | null;
  createdAt: string;
  periodStart: string | null;
  periodEnd: string | null;
}
