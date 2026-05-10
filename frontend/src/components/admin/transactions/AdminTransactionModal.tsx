"use client";

import Modal from "@/components/common/Modal";
import {
  PaymentLineResponseDto,
  PaymentStatus,
} from "@/types/paymentLine";

type Props = {
  transaction: PaymentLineResponseDto | null;
  onClose: () => void;
};

const getStatusBadgeClass = (status: PaymentStatus) => {
  switch (status) {
    case "SUCCEEDED":
      return "badge-success";
    case "PENDING":
      return "badge-warning";
    case "FAILED":
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "badge-error";
    default:
      return "badge-ghost";
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
};

const formatCurrency = (value?: number, currency = "EUR") => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)} ${currency}`;
};

export default function AdminTransactionModal({
  transaction,
  onClose,
}: Props) {
  if (!transaction) return null;

  return (
    <Modal isOpen={!!transaction} onClose={onClose}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-lg font-bold">Transaction #{transaction.id}</h3>
          <p className="mt-1 text-sm opacity-70">
            Review the payment-line details, linked references, and amount
            breakdown.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${getStatusBadgeClass(transaction.status)}`}
              >
                {transaction.status}
              </span>
            </p>
            <p>
              <strong>Type:</strong> {transaction.type}
            </p>
            <p>
              <strong>Currency:</strong> {transaction.currency}
            </p>
            <p>
              <strong>Created:</strong> {formatDateTime(transaction.createdAt)}
            </p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <p>
              <strong>Shop ID:</strong> {transaction.shopId}
            </p>
            <p>
              <strong>Payment ID:</strong> {transaction.paymentId ?? "-"}
            </p>
            <p>
              <strong>Order ID:</strong> {transaction.orderId ?? "-"}
            </p>
            <p>
              <strong>Order Item ID:</strong> {transaction.orderItemId ?? "-"}
            </p>
            <p>
              <strong>Session ID:</strong> {transaction.sessionId ?? "-"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-1 sm:p-4">
            <p className="opacity-70">Gross Amount</p>
            <p className="text-base font-semibold">
              {formatCurrency(transaction.grossAmount, transaction.currency)}
            </p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-1 sm:p-4">
            <p className="opacity-70">Platform Fee</p>
            <p className="text-base font-semibold">
              {formatCurrency(transaction.platformFee, transaction.currency)}
            </p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-1 sm:p-4">
            <p className="opacity-70">Shop Amount</p>
            <p className="text-base font-semibold text-green-600">
              {formatCurrency(transaction.shopAmount, transaction.currency)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
          <h4 className="font-semibold text-base">Booking Details</h4>
          <p>
            <strong>Tour:</strong> {transaction.tourTitle || "-"}
          </p>
          <p>
            <strong>Scheduled At:</strong>{" "}
            {formatDateTime(transaction.scheduledAt)}
          </p>
          <p>
            <strong>Participants:</strong> {transaction.participants ?? "-"}
          </p>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
