"use client";

import { OrderItemResponseDto } from "@/types/order";
import { Item } from "@/types";
import { Circle } from "lucide-react";

interface Props {
  item: OrderItemResponseDto;
  tour?: Item;
  onConfirm: (id: number) => void;
  onClick: () => void;
}

export default function OrderItemCard({
  item,
  tour,
  onConfirm,
  onClick,
}: Props) {
  const statusColor =
    item.status === "CONFIRMED"
      ? "text-green-500"
      : item.status === "PENDING"
      ? "text-yellow-500"
      : item.status === "CANCELLED"
      ? "text-red-500"
      : "text-gray-400"; // COMPLETED

  return (
    <div
      className="flex items-center justify-between bg-base-100 shadow-md border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      {/* Left content: status + details */}
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

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {tour && (
          <button
            className="btn btn-sm btn-outline"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/tours/${tour.id}`;
            }}
          >
            View Tour
          </button>
        )}

        {item.status !== "CONFIRMED" && item.status !== "COMPLETED" && (
          <button
            className="btn btn-sm btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(item.id);
            }}
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
}
