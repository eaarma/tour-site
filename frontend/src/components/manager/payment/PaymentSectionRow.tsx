"use client";

import { PaymentLineResponseDto } from "@/types/paymentLine";
import { Calendar, CreditCard } from "lucide-react";

interface Props {
  payment: PaymentLineResponseDto;
  onView?: (payment: PaymentLineResponseDto) => void;
}

export default function PaymentSectionRow({ payment, onView }: Props) {
  const statusColor =
    payment.status === "PAID"
      ? "badge-success"
      : payment.status === "FAILED"
        ? "badge-error"
        : "badge-neutral";

  return (
    <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-base-200/40 transition-colors border-b border-base-200">
      {/* LEFT */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date(payment.createdAt).toLocaleString()}
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="w-4 h-4 text-primary" />
          Order #{payment.orderId}
        </div>
      </div>

      {/* RIGHT */}

      <div className="flex flex-col md:flex-row md:items-center gap-6 text-sm">
        <div>
          Gross: <strong>€{payment.grossAmount.toFixed(2)}</strong>
        </div>

        <div>
          Fee: <strong>€{payment.platformFee.toFixed(2)}</strong>
        </div>

        <div className="text-green-600 font-semibold">
          €{payment.shopAmount.toFixed(2)}
        </div>

        <span className={`badge badge-sm ${statusColor}`}>
          {payment.status}
        </span>

        {onView && (
          <button
            className="btn btn-sm btn-outline hover:border-primary hover:text-primary"
            onClick={() => onView(payment)}
          >
            View
          </button>
        )}
      </div>
    </div>
  );
}
