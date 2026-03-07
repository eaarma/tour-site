"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { BookingService } from "@/lib/bookingService";
import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { CancellationReasonType } from "@/types/cancellation";
import toast from "react-hot-toast";

interface ManageOrderItemCardProps {
  item: OrderItemResponseDto;
  router: AppRouterInstance;
  token: string;
  onCancelled: (itemId: number, newStatus: OrderStatus) => void;
}

export default function ManageOrderItemCard({
  item,
  router,
  token,
  onCancelled,
}: ManageOrderItemCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reasonType, setReasonType] = useState<CancellationReasonType | null>(
    null,
  );
  const [reasonText, setReasonText] = useState("");

  const scheduled = format(
    new Date(item.scheduledAt),
    "EEEE, dd MMM yyyy HH:mm",
  );

  const handleCancel = async () => {
    if (!token) return;

    if (!reasonType) {
      toast.error("Please select a cancellation reason.");
      return;
    }

    if (reasonType === "OTHER" && reasonText.trim().length === 0) {
      toast.error("Please provide additional details.");
      return;
    }

    try {
      setLoading(true);

      const res = await BookingService.cancelItem(
        token,
        item.id,
        reasonType,
        reasonText,
      );
      onCancelled(item.id, res.newStatus as OrderStatus);

      setConfirmOpen(false);

      toast.success(
        res.refundable
          ? `Booking cancelled. Refund €${res.refundAmount.toFixed(
              2,
            )} will arrive in 5–10 business days.`
          : "Booking cancelled. This booking was non-refundable.",
      );
    } catch {
      toast.error("Cancellation failed.");
    } finally {
      setLoading(false);
    }
  };

  const isCancelled =
    item.status === "CANCELLED" || item.status === "CANCELLED_CONFIRMED";

  return (
    <>
      <div className="bg-base-100 shadow-xl rounded-xl border border-base-300 p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          {/* Left */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{item.tourTitle}</h2>

            <div className="text-sm text-base-content/70 space-y-1">
              <p>
                <strong>Date:</strong> {scheduled}
              </p>
              <p>
                <strong>Participants:</strong> {item.participants}
              </p>
              <p>
                <strong>Meeting Point:</strong>{" "}
                {item.tourMeetingPoint || "Provided after confirmation"}
              </p>
              <p>
                <strong>Status:</strong> {item.status}
              </p>
            </div>

            <div className="text-sm pt-2">
              <p className="font-semibold">€{item.pricePaid.toFixed(2)}</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => router.push(`/items/${item.tourId}`)}
              className="btn btn-outline btn-sm"
            >
              View Tour
            </button>

            {!isCancelled && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="btn btn-error btn-sm"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold mb-2">
              Cancel {item.tourTitle}?
            </h3>

            <p className="text-sm text-base-content/70">
              This action cannot be undone.
            </p>

            <div>
              <label className="text-sm font-semibold">
                Reason for cancellation
              </label>

              <select
                className="select select-bordered w-full mt-1"
                value={reasonType ?? ""}
                onChange={(e) =>
                  setReasonType(e.target.value as CancellationReasonType)
                }
              >
                <option value="">Select a reason</option>
                <option value="SCHEDULE_CONFLICT">Schedule conflict</option>
                <option value="FOUND_ALTERNATIVE">Found alternative</option>
                <option value="WEATHER">Weather</option>
                <option value="PERSONAL">Personal reasons</option>
                <option value="HEALTH">Health</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {reasonType === "OTHER" && (
              <div>
                <label className="text-sm font-semibold">
                  Additional details
                </label>

                <textarea
                  className="textarea textarea-bordered w-full mt-1"
                  maxLength={500}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                />

                <p className="text-xs text-base-content/60 text-right">
                  {reasonText.length}/500
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="btn btn-outline btn-sm"
                disabled={loading}
              >
                No
              </button>

              <button
                onClick={handleCancel}
                className="btn btn-error btn-sm"
                disabled={loading || !reasonType}
              >
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
