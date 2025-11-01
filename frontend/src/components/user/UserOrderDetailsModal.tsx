"use client";

import { OrderItemResponseDto } from "@/types/order";
import Link from "next/link";

interface UserOrderDetailsModalProps {
  orderItem: OrderItemResponseDto;
  onClose: () => void;
}

export default function UserOrderDetailsModal({
  orderItem,
  onClose,
}: UserOrderDetailsModalProps) {
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
              <p>${orderItem.pricePaid.toFixed(2)}</p>
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

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
