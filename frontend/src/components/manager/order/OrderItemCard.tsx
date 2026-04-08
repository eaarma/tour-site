"use client";

import { OrderItemCardDto } from "@/types/order";
import { Users, Euro, Dot, Calendar, Clock } from "lucide-react";

interface Props {
  item: OrderItemCardDto;
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

  const scheduled = new Date(item.scheduledAt);
  const created = new Date(item.createdAt);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-base-300 bg-base-100 
        hover:border-primary/60 hover:shadow-lg transition-all p-4 flex justify-between items-start gap-4"
    >
      {/* LEFT SIDE */}
      <div className="flex-1 sm:ml-2">
        {/* Name */}
        <h3 className="text-base font-semibold text-gray-800 tracking-wide">
          {item.name}
        </h3>

        {/* Scheduled at */}
        <div className="flex items-center gap-2 text-sm text-primary font-medium mt-1">
          <Calendar className="w-4 h-4" />
          {scheduled.toLocaleDateString("en-GB")}{" "}
          <Clock className="w-4 h-4 ml-2" />
          {scheduled.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Participants + Price + Status */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-10 text-sm mt-2 text-gray-600">
          <div className="flex items-center gap-1 font-medium text-gray-700">
            <Users className="w-4 h-4" />
            {item.participants}
          </div>

          <div className="flex items-center gap-1 font-medium text-gray-700">
            <Euro className="w-4 h-4" />€{item.pricePaid.toFixed(2)}
          </div>

          <div className={`flex items-center gap-1 font-medium ${statusStyle}`}>
            <Dot className="w-5 h-5" />
            {item.status}
          </div>
        </div>

        {/* Footer metadata */}
        <div className="flex items-center gap-4 sm:gap-10 mt-3 text-xs text-gray-400">
          <span>Order Item #{item.id}</span>
          <span>
            Created {created.toLocaleDateString("en-GB")}{" "}
            {created.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
