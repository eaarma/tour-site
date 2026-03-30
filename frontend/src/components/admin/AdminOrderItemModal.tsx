"use client";

import Modal from "@/components/common/Modal";
import { OrderItemResponseDto, OrderStatus } from "@/types/order";

type Props = {
  orderItem: OrderItemResponseDto | null;
  onClose: () => void;
};

const getStatusBadgeClass = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
    case "CONFIRMED":
    case "COMPLETED":
      return "badge-success";
    case "RESERVED":
    case "FINALIZED":
    case "PENDING":
    case "PLANNED":
    case "PARTIALLY_PAID":
      return "badge-warning";
    case "CANCELLED":
    case "CANCELLED_CONFIRMED":
    case "PARTIALLY_CANCELLED":
    case "FAILED":
    case "EXPIRED":
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "badge-error";
    default:
      return "badge-ghost";
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)} EUR`;
};

export default function AdminOrderItemModal({ orderItem, onClose }: Props) {
  if (!orderItem) return null;

  return (
    <Modal isOpen={!!orderItem} onClose={onClose}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-lg font-bold">Order Item #{orderItem.id}</h3>
          <p className="mt-1 text-sm opacity-70">{orderItem.tourTitle}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <p>
              <strong>Status:</strong>{" "}
              <span className={`badge ${getStatusBadgeClass(orderItem.status)}`}>
                {orderItem.status}
              </span>
            </p>
            <p>
              <strong>Participants:</strong> {orderItem.participants}
            </p>
            <p>
              <strong>Price Paid:</strong> {formatCurrency(orderItem.pricePaid)}
            </p>
            <p>
              <strong>Scheduled:</strong> {formatDateTime(orderItem.scheduledAt)}
            </p>
            <p>
              <strong>Created:</strong> {formatDateTime(orderItem.createdAt)}
            </p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <p>
              <strong>Tour ID:</strong> {orderItem.tourId}
            </p>
            <p>
              <strong>Shop ID:</strong> {orderItem.shopId}
            </p>
            <p>
              <strong>Session ID:</strong> {orderItem.sessionId ?? "-"}
            </p>
            <p>
              <strong>Preferred Language:</strong>{" "}
              {orderItem.preferredLanguage || "-"}
            </p>
            <p>
              <strong>Meeting Point:</strong> {orderItem.tourMeetingPoint || "-"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
          <h4 className="font-semibold text-base">Customer</h4>
          <p>
            <strong>Name:</strong> {orderItem.name}
          </p>
          <p>
            <strong>Email:</strong> {orderItem.email}
          </p>
          <p>
            <strong>Phone:</strong> {orderItem.phone}
          </p>
          <p>
            <strong>Nationality:</strong> {orderItem.nationality || "-"}
          </p>
        </div>

        <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
          <h4 className="font-semibold text-base">Assignment</h4>
          <p>
            <strong>Manager ID:</strong> {orderItem.managerId || "-"}
          </p>
          <p>
            <strong>Manager Name:</strong> {orderItem.managerName || "-"}
          </p>
        </div>

        <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
          <h4 className="font-semibold text-base">Notes</h4>
          <p className="whitespace-pre-line">
            <strong>Comment:</strong> {orderItem.comment || "-"}
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
