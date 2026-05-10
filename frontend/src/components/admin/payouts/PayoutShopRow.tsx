"use client";

import toast from "react-hot-toast";
import { PayoutStatus } from "@/types/payout";

type Props = {
  shopName: string;
  shopId: number;
  transactionCount: number;
  totalAmount: number;
  currency?: string;
  status?: PayoutStatus | null;
  payoutId?: number | null;
  paidAt?: string | null;
  showPayoutStatus?: boolean;
  onView?: () => void;
  onPayout?: () => void;
};

const formatCurrency = (value: number, currency: string) =>
  `${value.toFixed(2)} ${currency}`;

const getAmountClass = (value: number) => {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "";
};

const formatDate = (value?: string | null) => {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("en-GB");
};

const getStatusLabel = (status?: PayoutStatus | null, payoutId?: number | null) => {
  if (status === "PENDING" && !payoutId) return "Ready for payout";
  if (status) return status.charAt(0) + status.slice(1).toLowerCase();
  if (payoutId) return "Recorded payout";
  return null;
};

const getStatusClasses = (status?: PayoutStatus | null, payoutId?: number | null) => {
  if (status === "COMPLETED") {
    return "bg-green-100 text-green-700";
  }

  if (status === "FAILED") {
    return "bg-red-100 text-red-700";
  }

  if (status === "PROCESSING") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "PENDING" && !payoutId) {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-base-200 text-base-content/70";
};

export default function PayoutShopRow({
  shopName,
  shopId,
  transactionCount,
  totalAmount,
  currency = "EUR",
  status,
  payoutId,
  paidAt,
  showPayoutStatus = true,
  onView,
  onPayout,
}: Props) {
  const isCompletedPayout = status === "COMPLETED" && !!payoutId;
  const statusLabel = showPayoutStatus ? getStatusLabel(status, payoutId) : null;
  const paidAtLabel = showPayoutStatus ? formatDate(paidAt) : null;

  const handleView = () => {
    if (onView) {
      onView();
      return;
    }

    toast(`Would open payout summary for ${shopName} (#${shopId}).`);
  };

  const handlePayout = () => {
    if (isCompletedPayout) {
      toast(`Payout #${payoutId} is already recorded for ${shopName}.`);
      return;
    }

    if (onPayout) {
      onPayout();
      return;
    }

    toast(
      `Would create a payout of ${formatCurrency(totalAmount, currency)} for ${shopName} (#${shopId}).`,
    );
  };

  return (
    <div className="flex flex-col gap-3 py-4 lg:grid lg:grid-cols-[minmax(0,2fr)_140px_200px_auto] lg:items-center lg:gap-4">
      <div className="min-w-0 space-y-1 ml-4">
        <p className="truncate text-base font-semibold">{shopName}</p>
        <p className="text-sm opacity-60">Shop #{shopId}</p>
        {showPayoutStatus && (statusLabel || payoutId || paidAtLabel) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {statusLabel && (
              <span
                className={`inline-flex rounded-full px-2 py-1 font-medium ${getStatusClasses(
                  status,
                  payoutId,
                )}`}
              >
                {statusLabel}
              </span>
            )}
            {payoutId && <span className="opacity-60">Payout #{payoutId}</span>}
            {paidAtLabel && <span className="opacity-60">Paid {paidAtLabel}</span>}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3 lg:block lg:text-right">
        <p className="text-xs uppercase tracking-wide opacity-60">
          Transactions
        </p>
        <p className="text-sm font-medium tabular-nums">{transactionCount}</p>
      </div>

      <div className="flex items-baseline justify-between mr-4 gap-3 lg:block lg:text-right">
        <p className="text-xs uppercase tracking-wide opacity-60">
          Total Amount
        </p>
        <p
          className={`text-lg font-semibold tracking-tight tabular-nums ${getAmountClass(
            totalAmount,
          )}`}
        >
          {formatCurrency(totalAmount, currency)}
        </p>
      </div>

      <div className="flex gap-2 lg:justify-end mr-4">
        <button className="btn btn-sm btn-ghost" onClick={handleView}>
          View
        </button>
        {onPayout && (
          <button
            className="btn btn-sm btn-outline"
            onClick={handlePayout}
            disabled={isCompletedPayout}
          >
            {isCompletedPayout ? "Paid" : "Payout"}
          </button>
        )}
      </div>
    </div>
  );
}
