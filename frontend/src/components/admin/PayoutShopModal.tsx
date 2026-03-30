"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import Modal from "@/components/common/Modal";
import {
  PayoutHistoryEntryDto,
  PayoutLineRowDto,
  PayoutShopDetailsDto,
  PayoutShopSummaryDto,
} from "@/types/payout";

type Props = {
  shop: PayoutShopSummaryDto | null;
  details: PayoutShopDetailsDto | null;
  periodSummary: string;
  loading: boolean;
  onClose: () => void;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
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

const formatHistoryTimestamp = (paidAt?: string | null, createdAt?: string | null) =>
  paidAt ? formatDateTime(paidAt) : formatDateTime(createdAt);

const formatCurrency = (value?: number, currency = "EUR") => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)} ${currency}`;
};

const getAmountClass = (value: number) => {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "";
};

const getPayoutStatusLabel = (
  status: PayoutShopSummaryDto["payoutStatus"] | PayoutShopSummaryDto["status"],
  payoutId: PayoutShopSummaryDto["payoutId"] | PayoutShopDetailsDto["payoutId"],
) => {
  if (status === "PENDING" && !payoutId) return "Not paid out yet";
  if (status) return status.charAt(0) + status.slice(1).toLowerCase();
  if (payoutId) return "Recorded payout";
  return "Not paid out yet";
};

const getPayoutStatusClass = (
  status: PayoutShopSummaryDto["payoutStatus"] | PayoutShopSummaryDto["status"],
  payoutId: PayoutShopSummaryDto["payoutId"] | PayoutShopDetailsDto["payoutId"],
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

  if (row.sessionId) {
    return `Session #${row.sessionId}`;
  }

  return `Payment Line #${row.paymentLineId}`;
};

const getSessionKey = (
  group: PayoutShopDetailsDto["sessionGroups"][number],
  index: number,
) =>
  `${group.sessionId ?? "none"}-${group.sessionTitle}-${
    group.scheduledAt ?? "unscheduled"
  }-${index}`;

export default function PayoutShopModal({
  shop,
  details,
  periodSummary,
  loading,
  onClose,
}: Props) {
  const [expandedSessions, setExpandedSessions] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setExpandedSessions({});
  }, [periodSummary, shop?.shopId]);

  if (!shop) return null;

  const resolvedCurrency = details?.currency ?? shop.currency ?? "EUR";
  const totalPayoutsAmount =
    details?.payouts?.reduce(
      (sum, payout) => sum + (typeof payout.totalAmount === "number" ? payout.totalAmount : 0),
      0,
    ) ?? 0;
  const payoutHistory = details?.payouts ?? [];

  return (
    <Modal isOpen={!!shop} onClose={onClose}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-lg font-bold">{shop.shopName}</h3>
          <p className="mt-1 text-sm opacity-70">Shop #{shop.shopId}</p>
        </div>

        <div className="sticky top-0 z-10 space-y-3 border-b border-base-200 bg-base-100 pb-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
              <h4 className="font-semibold text-base">Selected Period</h4>
              <p>{periodSummary}</p>
            </div>

            <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
              <h4 className="font-semibold text-base">Summary</h4>
              <p>
                <strong>Transactions:</strong>{" "}
                {details?.transactionCount ?? shop.transactionCount}
              </p>
              <p className="text-base font-semibold">
                <strong>Total Amount:</strong>{" "}
                {formatCurrency(
                  details?.totalAmount ?? shop.totalAmount,
                  resolvedCurrency,
                )}
              </p>
              <p>
                <strong>Total Payouts:</strong>{" "}
                {formatCurrency(totalPayoutsAmount, resolvedCurrency)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-base-300 bg-base-100">
          <div className="border-b border-base-300 px-3 py-2 sm:px-4">
            <h4 className="font-semibold text-base">Payout History</h4>
          </div>

          <div className="px-3 sm:px-4">
            {loading ? (
              <div className="py-3 text-sm opacity-70">
                Loading payout history...
              </div>
            ) : payoutHistory.length === 0 ? (
              <div className="py-3 text-sm opacity-70">
                No payouts recorded in this view.
              </div>
            ) : (
              payoutHistory.map((payout, payoutIndex) => (
                <PayoutHistoryRow
                  key={payout.id}
                  payout={payout}
                  isLast={payoutIndex === payoutHistory.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-base-300 p-4 text-sm opacity-70">
            Loading payout details...
          </div>
        ) : !details || details.sessionGroups.length === 0 ? (
          <div className="rounded-lg border border-dashed border-base-300 p-4 text-sm opacity-70">
            No payout rows found for the selected shop and period.
          </div>
        ) : (
          <div className="space-y-3">
            {details.sessionGroups.map((group, index) => {
              const sessionKey = getSessionKey(group, index);
              const isExpanded = !!expandedSessions[sessionKey];

              return (
                <div
                  key={sessionKey}
                  className="rounded-lg border border-base-300 bg-base-100"
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 p-3 text-left sm:p-4"
                    onClick={() =>
                      setExpandedSessions((prev) => ({
                        ...prev,
                        [sessionKey]: !prev[sessionKey],
                      }))
                    }
                    aria-expanded={isExpanded}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 rounded-full bg-base-200 p-1 text-base-content/70">
                        <ChevronRight
                          className={`size-4 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </span>

                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-base">
                          {group.sessionTitle}
                        </h4>
                        <p className="text-sm opacity-70">
                          {group.sessionId
                            ? `Session #${group.sessionId}`
                            : "Sessionless entries"}
                        </p>
                        <p className="text-xs opacity-70">
                          Scheduled: {formatDateTime(group.scheduledAt)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`text-base font-semibold ${getAmountClass(
                          group.totalAmount,
                        )}`}
                      >
                        {formatCurrency(group.totalAmount, resolvedCurrency)}
                      </p>
                      <p className="text-xs opacity-70">
                        {group.transactionCount}{" "}
                        {group.transactionCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-base-300 px-3 sm:px-4">
                      {group.rows.map((row, rowIndex) => (
                        <div
                          key={row.paymentLineId}
                          className={`py-3 ${
                            rowIndex < group.rows.length - 1
                              ? "border-b border-base-200"
                              : ""
                          }`}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-1">
                              <p className="font-medium">{row.label}</p>
                              <p className="text-sm opacity-80">
                                {getRowMeta(row)}
                              </p>
                              <p className="text-sm opacity-80">
                                Tour: {row.tourTitle || "-"}
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-70">
                                <span>
                                  Scheduled: {formatDateTime(row.scheduledAt)}
                                </span>
                                <span>
                                  Participants: {row.participants ?? "-"}
                                </span>
                                <span>
                                  Created: {formatDateTime(row.createdAt)}
                                </span>
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
                                Gross:{" "}
                                {formatCurrency(row.grossAmount, row.currency)}{" "}
                                | Fee:{" "}
                                {formatCurrency(row.platformFee, row.currency)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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

function PayoutHistoryRow({
  payout,
  isLast,
}: {
  payout: PayoutHistoryEntryDto;
  isLast: boolean;
}) {
  return (
    <div className={`py-3 ${isLast ? "" : "border-b border-base-200"}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="font-medium">Payout #{payout.id}</p>
          <p className="text-sm opacity-80">
            Period: {formatPeriodRange(payout.periodStart, payout.periodEnd)}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-70">
            <span>Paid at: {formatHistoryTimestamp(payout.paidAt, payout.createdAt)}</span>
            <span>Method: {payout.method.replaceAll("_", " ")}</span>
            <span>
              Transactions: {payout.transactionCount ?? "-"}
            </span>
            {payout.reference && <span>Reference: {payout.reference}</span>}
          </div>
        </div>

        <div className="shrink-0 space-y-1 sm:text-right">
          <p className="text-base font-semibold text-red-600">
            -{formatCurrency(payout.totalAmount, payout.currency)}
          </p>
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPayoutStatusClass(
              payout.status,
              payout.id,
            )}`}
          >
            {getPayoutStatusLabel(payout.status, payout.id)}
          </span>
        </div>
      </div>
    </div>
  );
}
