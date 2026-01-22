"use client";

import { OrderItemCardDto } from "@/types/order";
import { Users, Euro, Dot } from "lucide-react";

interface Props {
  item: OrderItemCardDto;
  onConfirm: (id: number) => void;
  onConfirmCancellation: (id: number) => void;
  onComplete: (id: number) => void;
  onClick: () => void;
}

export default function OrderItemCard({ item, onClick }: Props) {
  const statusStyle =
    item.status === "CONFIRMED"
      ? "text-green-600"
      : item.status === "PENDING"
        ? "text-yellow-600"
        : item.status === "CANCELLED"
          ? "text-red-600"
          : item.status === "CANCELLED_CONFIRMED"
            ? "text-gray-500"
            : "text-gray-400";

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-base-300 bg-base-100 
        hover:border-primary/60 hover:shadow-lg transition-all p-4 flex justify-between items-start gap-4"
    >
      {/* Left: Name + meta */}
      <div className="flex-1">
        {/* Name */}
        <h3 className="text-base font-semibold text-gray-800 tracking-wide mb-1">
          {item.name}
        </h3>

        {/* Participants + Price */}
        <div className="flex items-center gap-5 text-sm mt-1 text-gray-600">
          <div className="flex items-center gap-1 font-medium text-gray-700">
            <Users className="w-4 h-4" />
            {item.participants}
          </div>

          <div className="flex items-center gap-1 font-medium text-gray-700">
            <Euro className="w-4 h-4" />
            {item.pricePaid}
          </div>

          {/* Status Indicator */}
          <div className={`flex items-center gap-1 font-medium ${statusStyle}`}>
            <Dot className="w-5 h-5" />
            {item.status}
          </div>
        </div>

        {/* Order ID */}
        <p className="text-xs text-gray-400 mt-2">Order Item #{item.id}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-row items-end gap-2 shrink-0">
        <button
          className="btn btn-sm btn-outline"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View
        </button>
      </div>
    </div>
  );
}
