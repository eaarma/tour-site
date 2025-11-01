"use client";

import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { Circle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  item: OrderItemResponseDto;
  onConfirm: (id: number) => void;
  onConfirmCancellation: (id: number) => void;
  onComplete: (id: number) => void;
  onClick: () => void;
}

export default function OrderItemCard({
  item,
  onConfirm,
  onConfirmCancellation,
  onComplete,
  onClick,
}: Props) {
  const { user } = useAuth();

  const isOwner = item.managerId && user?.id === item.managerId;

  const statusColor =
    item.status === "CONFIRMED"
      ? "text-green-500"
      : item.status === "PENDING"
      ? "text-yellow-500"
      : item.status === "CANCELLED"
      ? "text-red-500"
      : item.status === "CANCELLED_CONFIRMED"
      ? "text-gray-600"
      : "text-gray-400";

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
          isOwner && (
            <button
              className="btn btn-sm btn-success"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(item.id);
              }}
            >
              Completed
            </button>
          )
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex items-start justify-between bg-base-100 shadow-md border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      {/* Status icon */}
      <Circle className={`w-4 h-4 mt-1 ${statusColor}`} fill="currentColor" />

      {/* Left: main info */}
      <div className="flex flex-col flex-1 ml-4">
        {/* Top row — name + date + price */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h3 className="font-semibold text-base truncate">{item.name}</h3>

          <div className="flex flex-wrap items-center gap-x-3 text-sm text-gray-600">
            <span>
              <strong>Tour:</strong> {item.tourTitle}
            </span>
            <span>
              <strong>Price:</strong> €{item.pricePaid.toFixed(2)}
            </span>
            <span>
              <strong>Scheduled:</strong>{" "}
              {new Date(item.scheduledAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Bottom row — IDs and assigned */}
        <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <strong>ID:</strong> #{item.id}
          </span>
          <span>
            <strong>Assigned to:</strong>{" "}
            {item.managerName ? (
              <span className="text-gray-700 font-medium">
                {item.managerName}
              </span>
            ) : (
              "Unassigned"
            )}
          </span>
        </div>
      </div>

      {/* Right: buttons */}
      <div className="flex items-end gap-2 ml-4">
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
