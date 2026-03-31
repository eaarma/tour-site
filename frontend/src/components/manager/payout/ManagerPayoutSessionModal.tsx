"use client";

import Modal from "@/components/common/Modal";
import { PayoutLineRowDto, PayoutSessionDetailsDto, PayoutSessionSummaryDto } from "@/types/payout";

type Props = {
  session: PayoutSessionSummaryDto | null;
  details: PayoutSessionDetailsDto | null;
  loading: boolean;
  onClose: () => void;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    ).toLocaleDateString("en-GB");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB");
};

const formatPeriodRange = (start?: string | null, end?: string | null) => {
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  if (start) return `From ${formatDate(start)}`;
  if (end) return `Until ${formatDate(end)}`;

  return "-";
};

const formatCurrency = (value?: number, currency = "EUR") => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)} ${currency}`;
};

const getAmountClass = (value: number) => {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "";
};

const getStatusLabel = (
  status: PayoutSessionSummaryDto["payoutStatus"] | PayoutSessionSummaryDto["status"],
  payoutId: number | null | undefined,
) => {
  if (status === "PENDING" && !payoutId) return "Ready for payout";
  if (status) return status.charAt(0) + status.slice(1).toLowerCase();
  if (payoutId) return "Recorded payout";
  return "No payout recorded";
};

const getStatusClass = (
  status: PayoutSessionSummaryDto["payoutStatus"] | PayoutSessionSummaryDto["status"],
  payoutId: number | null | undefined,
) => {
  if (status === "COMPLETED") return "bg-green-100 text-green-700";
  if (status === "FAILED") return "bg-red-100 text-red-700";
  if (status === "PROCESSING") return "bg-amber-100 text-amber-700";
  if (status === "PENDING" && !payoutId) return "bg-blue-100 text-blue-700";
  return "bg-base-200 text-base-content/70";
};

const getRowMeta = (row: PayoutLineRowDto) => {
  if (row.orderItemId) {
    return `Order #${row.orderId ?? "-"} / Item #${row.orderItemId}`;
  }

  return `Payment Line #${row.paymentLineId}`;
};

export default function ManagerPayoutSessionModal({
  session,
  details,
  loading,
  onClose,
}: Props) {
  if (!session) return null;

  const resolvedDetails = details ?? session;
  const resolvedCurrency = details?.currency ?? session.currency ?? "EUR";

  return (
    <Modal isOpen={!!session} onClose={onClose}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-lg font-bold">{session.sessionTitle}</h3>
          <p className="mt-1 text-sm opacity-70">
            {session.sessionId
              ? `Session #${session.sessionId}`
              : "Sessionless entries"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <h4 className="font-semibold text-base">Summary</h4>
            <p>
              <strong>Scheduled:</strong>{" "}
              {formatDateTime(resolvedDetails.scheduledAt)}
            </p>
            <p>
              <strong>Manager:</strong> {resolvedDetails.managerName || "-"}
            </p>
            <p>
              <strong>Viewed Period:</strong>{" "}
              {formatPeriodRange(
                resolvedDetails.periodStart,
                resolvedDetails.periodEnd,
              )}
            </p>
            <p>
              <strong>Transactions:</strong>{" "}
              {resolvedDetails.transactionCount ?? 0}
            </p>
            <p className="text-base font-semibold">
              <strong>Total Amount:</strong>{" "}
              {formatCurrency(resolvedDetails.totalAmount, resolvedCurrency)}
            </p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <h4 className="font-semibold text-base">Payout State</h4>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(
                  resolvedDetails.payoutStatus ?? resolvedDetails.status,
                  resolvedDetails.payoutId,
                )}`}
              >
                {getStatusLabel(
                  resolvedDetails.payoutStatus ?? resolvedDetails.status,
                  resolvedDetails.payoutId,
                )}
              </span>
              {resolvedDetails.payoutId && (
                <span className="text-xs opacity-70">
                  Payout #{resolvedDetails.payoutId}
                </span>
              )}
            </div>
            <p>
              <strong>Payout Amount:</strong>{" "}
              {formatCurrency(
                resolvedDetails.payoutAmount ?? undefined,
                resolvedCurrency,
              )}
            </p>
            <p>
              <strong>Payout Period:</strong>{" "}
              {formatPeriodRange(
                resolvedDetails.payoutPeriodStart,
                resolvedDetails.payoutPeriodEnd,
              )}
            </p>
            <p>
              <strong>Paid At:</strong> {formatDateTime(resolvedDetails.paidAt)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-base-300 p-4 text-sm opacity-70">
            Loading session transactions...
          </div>
        ) : !details || details.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-base-300 p-4 text-sm opacity-70">
            No payout transactions found for this session in the selected period.
          </div>
        ) : (
          <div className="rounded-lg border border-base-300 bg-base-100">
            <div className="border-b border-base-300 px-3 py-2 sm:px-4">
              <h4 className="font-semibold text-base">Transactions</h4>
            </div>

            <div className="px-3 sm:px-4">
              {details.rows.map((row, index) => (
                <div
                  key={row.paymentLineId}
                  className={`py-3 ${
                    index < details.rows.length - 1 ? "border-b border-base-200" : ""
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{row.label}</p>
                      <p className="text-sm opacity-80">{getRowMeta(row)}</p>
                      <p className="text-sm opacity-80">
                        Tour: {row.tourTitle || "-"}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-70">
                        <span>
                          Scheduled: {formatDateTime(row.scheduledAt)}
                        </span>
                        <span>Participants: {row.participants ?? "-"}</span>
                        <span>Created: {formatDateTime(row.createdAt)}</span>
                      </div>
                    </div>

                    <div className="shrink-0 space-y-1 sm:text-right">
                      <p
                        className={`text-base font-semibold ${getAmountClass(
                          row.shopAmount,
                        )}`}
                      >
                        {formatCurrency(row.shopAmount, row.currency)}
                      </p>
                      <p className="text-xs opacity-70">
                        Gross: {formatCurrency(row.grossAmount, row.currency)} |
                        Fee: {formatCurrency(row.platformFee, row.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
