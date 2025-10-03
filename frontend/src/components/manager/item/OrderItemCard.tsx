"use client";

import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { Item } from "@/types";
import { Circle } from "lucide-react";

interface Props {
  item: OrderItemResponseDto;
  tour?: Item;
  onConfirm: (id: number) => void; // PENDING → CONFIRMED
  onConfirmCancellation: (id: number) => void; // CANCELLED → CANCELLED_CONFIRMED
  onComplete: (id: number) => void; // CONFIRMED → COMPLETED
  onClick: () => void; // open modal
}

export default function OrderItemCard({
  item,
  tour,
  onConfirm,
  onConfirmCancellation,
  onComplete,
  onClick,
}: Props) {
  const statusColor =
    item.status === "CONFIRMED"
      ? "text-green-500"
      : item.status === "PENDING"
      ? "text-yellow-500"
      : item.status === "CANCELLED"
      ? "text-red-500"
      : item.status === "CANCELLED_CONFIRMED"
      ? "text-gray-600"
      : "text-gray-400"; // COMPLETED fallback

  const renderActions = () => {
    switch (item.status as OrderStatus) {
      case "PENDING":
        return (
          <button
            className="btn btn-sm btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(item.id);
            }}
          >
            Confirm
          </button>
        );

      case "CANCELLED":
        return (
          <button
            className="btn btn-sm btn-error"
            onClick={(e) => {
              e.stopPropagation();
              onConfirmCancellation(item.id);
            }}
          >
            Confirm Cancellation
          </button>
        );

      case "CONFIRMED":
        return (
          <button
            className="btn btn-sm btn-success"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(item.id);
            }}
          >
            Completed
          </button>
        );

      default:
        return null; // COMPLETED, CANCELLED_CONFIRMED
    }
  };

  return (
    <div
      className="flex items-center justify-between bg-base-100 shadow-md border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      {/* Left: status light + info */}
      <div className="flex items-center gap-3 flex-1">
        <Circle className={`w-4 h-4 ${statusColor}`} fill="currentColor" />

        <div className="grid grid-cols-4 gap-4 w-full text-sm">
          <span className="font-semibold">{item.tourTitle}</span>
          <span className="text-gray-600">
            {new Date(item.scheduledAt).toLocaleString()}
          </span>
          <span>
            {item.participants} × €{item.pricePaid.toFixed(2)}
          </span>
          <span className="font-medium">
            Total: €{(item.participants * item.pricePaid).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Right: always "View Order" + conditional actions */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-sm btn-outline"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Order
        </button>

        {renderActions()}
      </div>
    </div>
  );
}
