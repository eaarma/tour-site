"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { OrderItemResponseDto, OrderResponseDto, OrderStatus } from "@/types/order";
import AdminOrderItemModal from "./AdminOrderItemModal";

type Props = {
  order: OrderResponseDto | null;
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

const getCustomerName = (order: OrderResponseDto) => order.items[0]?.name || "-";
const getCustomerEmail = (order: OrderResponseDto) => order.items[0]?.email || "-";
const getCustomerPhone = (order: OrderResponseDto) => order.items[0]?.phone || "-";
const getCustomerNationality = (order: OrderResponseDto) =>
  order.items[0]?.nationality || "-";

export default function AdminOrderModal({ order, onClose }: Props) {
  const [selectedItem, setSelectedItem] = useState<OrderItemResponseDto | null>(
    null,
  );

  if (!order) return null;

  return (
    <>
      <Modal isOpen={!!order} onClose={onClose}>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg font-bold">Order #{order.id}</h3>
            <p className="mt-1 text-sm opacity-70">
              Review the order summary and inspect each order item separately.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
              <p>
                <strong>Status:</strong>{" "}
                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </p>
              <p>
                <strong>Total:</strong> {formatCurrency(order.totalPrice)}
              </p>
              <p>
                <strong>Payment Method:</strong> {order.paymentMethod || "-"}
              </p>
              <p>
                <strong>Items:</strong> {order.items.length}
              </p>
            </div>

            <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
              <p>
                <strong>Created:</strong> {formatDateTime(order.createdAt)}
              </p>
              <p>
                <strong>Updated:</strong> {formatDateTime(order.updatedAt)}
              </p>
              <p>
                <strong>Expires:</strong> {formatDateTime(order.expiresAt)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <h4 className="font-semibold text-base">Customer</h4>
            <p>
              <strong>Name:</strong> {getCustomerName(order)}
            </p>
            <p>
              <strong>Email:</strong> {getCustomerEmail(order)}
            </p>
            <p>
              <strong>Phone:</strong> {getCustomerPhone(order)}
            </p>
            <p>
              <strong>Nationality:</strong> {getCustomerNationality(order)}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base">Order Items</h4>
              <span className="text-sm opacity-70">
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </span>
            </div>

            {order.items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-base-300 p-3 text-sm opacity-70 sm:p-4">
                No order items found for this order.
              </div>
            ) : (
              <div className="space-y-3 pr-1 sm:max-h-[40vh] sm:overflow-y-auto">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-base-300 p-3 text-sm sm:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{item.tourTitle}</p>
                        <p className="opacity-80">Order Item #{item.id}</p>
                        <p className="opacity-80">
                          Scheduled: {formatDateTime(item.scheduledAt)}
                        </p>
                        <p className="opacity-80">
                          Participants: {item.participants}
                        </p>
                        <p className="opacity-80">
                          Price: {formatCurrency(item.pricePaid)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <span
                          className={`badge ${getStatusBadgeClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                        <button
                          className="btn btn-sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button className="btn btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      {selectedItem && (
        <AdminOrderItemModal
          orderItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
