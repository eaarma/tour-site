"use client";

import { OrderService } from "@/lib/orderService";
import { CancellationReasonType } from "@/types/cancellation";
import { OrderItemResponseDto } from "@/types/order";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface UserOrderDetailsModalProps {
  orderItem: OrderItemResponseDto;
  onClose: () => void;
  onCancelled?: (itemId: number, newStatus: string) => void;
}

export default function UserOrderDetailsModal({
  orderItem,
  onClose,
  onCancelled,
}: UserOrderDetailsModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reasonType, setReasonType] = useState<CancellationReasonType | null>(
    null,
  );
  const [reasonText, setReasonText] = useState("");

  const handleCancel = async () => {
    if (!reasonType) {
      toast.error("Please select a reason.");
      return;
    }

    if (reasonType === "OTHER" && reasonText.trim().length === 0) {
      toast.error("Please provide additional details.");
      return;
    }

    try {
      setLoading(true);

      const res = await OrderService.cancelOrderItem(
        orderItem.id,
        reasonType,
        reasonText,
      );

      toast.success(
        res.refundable
          ? `Cancelled. Refund €${res.refundAmount.toFixed(
              2,
            )} will arrive in 5–10 business days.`
          : "Booking cancelled. This booking was non-refundable.",
      );

      onCancelled?.(orderItem.id, res.newStatus);
      onClose();
    } catch {
      toast.error("Cancellation failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetCancellationState = () => {
    setConfirmOpen(false);
    setReasonType(null);
    setReasonText("");
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box relative max-w-lg">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="text-lg font-bold mb-3">Order Details</h3>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-sm">Tour</p>
            <p>{orderItem.tourTitle}</p>
          </div>

          <div>
            <p className="font-semibold text-sm">Scheduled Date</p>
            <p>
              {new Date(orderItem.scheduledAt).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-sm">Participants</p>
              <p>{orderItem.participants}</p>
            </div>
            <div>
              <p className="font-semibold text-sm">Price Paid</p>
              <p>€{orderItem.pricePaid.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-sm">Status</p>
            <span
              className={`badge ${
                orderItem.status === "COMPLETED"
                  ? "badge-success"
                  : orderItem.status === "CANCELLED_CONFIRMED"
                    ? "badge-error"
                    : "badge-info"
              }`}
            >
              {orderItem.status}
            </span>
          </div>

          <div>
            <p className="font-semibold text-sm">Customer Info</p>
            <p>{orderItem.name}</p>
            <p className="text-sm text-gray-500">{orderItem.email}</p>
            {orderItem.phone && (
              <p className="text-sm text-gray-500">{orderItem.phone}</p>
            )}
          </div>

          {orderItem.managerName && (
            <div>
              <p className="font-semibold text-sm">Tour guide</p>
              <p>
                <Link
                  href={`/manager/${orderItem.managerId}`}
                  className="link link-primary hover:underline"
                >
                  {orderItem.managerName}
                </Link>
              </p>
            </div>
          )}

          {orderItem.nationality && (
            <div>
              <p className="font-semibold text-sm">Nationality</p>
              <p>{orderItem.nationality}</p>
            </div>
          )}
        </div>

        {new Date(orderItem.scheduledAt) > new Date() &&
          orderItem.status !== "CANCELLED_CONFIRMED" &&
          orderItem.status !== "CANCELLED" && (
            <div className="pt-4 border-t mt-4">
              <button
                className="btn btn-error btn-sm"
                onClick={() => setConfirmOpen(true)}
              >
                Cancel Booking
              </button>
            </div>
          )}
        {confirmOpen && (
          <div className="mt-4 p-4 bg-base-100 rounded-lg space-y-4">
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
                  Additional details (optional)
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
                className="btn btn-outline btn-sm"
                disabled={loading}
                onClick={resetCancellationState}
              >
                No
              </button>

              <button
                className="btn btn-error btn-sm"
                disabled={loading || !reasonType}
                onClick={handleCancel}
              >
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        )}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
