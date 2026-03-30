"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import AdminOrderItemModal from "./AdminOrderItemModal";
import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { SessionStatus, TourSessionDto } from "@/types/tourSession";

type Props = {
  session: TourSessionDto | null;
  onClose: () => void;
};

const getStatusBadgeClass = (status: SessionStatus | OrderStatus) => {
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

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  return value.slice(0, 5);
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

export default function AdminSessionModal({ session, onClose }: Props) {
  const [selectedItem, setSelectedItem] = useState<OrderItemResponseDto | null>(
    null,
  );

  if (!session) return null;

  return (
    <>
      <Modal isOpen={!!session} onClose={onClose}>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg font-bold">Session #{session.id}</h3>
            <p className="mt-1 text-sm opacity-70">
              Review the session summary and inspect each linked order item
              separately.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
              <p>
                <strong>Status:</strong>{" "}
                <span className={`badge ${getStatusBadgeClass(session.status)}`}>
                  {session.status}
                </span>
              </p>
              <p>
                <strong>Tour:</strong> {session.tourTitle}
              </p>
              <p>
                <strong>Tour ID:</strong> {session.tourId}
              </p>
              <p>
                <strong>Schedule ID:</strong> {session.scheduleId}
              </p>
              <p>
                <strong>Shop ID:</strong> {session.shopId}
              </p>
            </div>

            <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
              <p>
                <strong>Date:</strong> {formatDate(session.date)}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(session.time)}
              </p>
              <p>
                <strong>Booked:</strong> {session.bookedParticipants}
              </p>
              <p>
                <strong>Remaining:</strong> {session.remaining}
              </p>
              <p>
                <strong>Max Participants:</strong> {session.maxParticipants}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <h4 className="font-semibold text-base">Manager</h4>
            <p>
              <strong>Name:</strong> {session.managerName || "-"}
            </p>
            <p>
              <strong>Email:</strong> {session.managerEmail || "-"}
            </p>
            <p>
              <strong>Role:</strong> {session.managerRole || "-"}
            </p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm space-y-2 sm:p-4">
            <h4 className="font-semibold text-base">Location</h4>
            <p>
              <strong>Location:</strong> {session.tourLocation || "-"}
            </p>
            <p>
              <strong>Meeting Point:</strong> {session.tourMeetingPoint || "-"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-base">Order Items</h4>
              <span className="text-sm opacity-70">
                {session.participants.length} item
                {session.participants.length === 1 ? "" : "s"}
              </span>
            </div>

            {session.participants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-base-300 p-3 text-sm opacity-70 sm:p-4">
                No order items are linked to this session.
              </div>
            ) : (
              <div className="space-y-3 pr-1 sm:max-h-[40vh] sm:overflow-y-auto">
                {session.participants.map((item) => (
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
