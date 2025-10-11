"use client";

import Modal from "@/components/common/Modal";
import { Item, OrderItemResponseDto, OrderStatus } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderItem: OrderItemResponseDto | null;
  tour?: Item;
  onConfirm: (id: number) => void; // PENDING → CONFIRMED
  onConfirmCancellation: (id: number) => void; // CANCELLED → CANCELLED_CONFIRMED
  onComplete: (id: number) => void; // CONFIRMED → COMPLETED
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderItem,
  tour,
  onConfirm,
  onConfirmCancellation,
  onComplete,
}: Props) {
  if (!orderItem) return null;

  const renderActionButton = () => {
    switch (orderItem.status as OrderStatus) {
      case "PENDING":
        return (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onConfirm(orderItem.id)}
          >
            Confirm
          </button>
        );

      case "CANCELLED":
        return (
          <button
            className="btn btn-sm btn-error"
            onClick={() => onConfirmCancellation(orderItem.id)}
          >
            Confirm Cancellation
          </button>
        );

      case "CONFIRMED":
        return (
          <button
            className="btn btn-sm btn-success"
            onClick={() => onComplete(orderItem.id)}
          >
            Completed
          </button>
        );

      default:
        return null; // COMPLETED, CANCELLED_CONFIRMED
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">Order Item #{orderItem.id}</h2>
        {renderActionButton()}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Status: <span className="font-medium">{orderItem.status}</span>
      </p>

      {tour && (
        <div className="mb-4">
          {tour.image && (
            <img
              src={tour.image}
              alt={tour.title}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
          )}
          <h3 className="text-lg font-semibold">{tour.title}</h3>
          {tour.location && (
            <p className="text-sm text-gray-600">{tour.location}</p>
          )}
        </div>
      )}

      <div className="space-y-2 text-sm">
        <p>
          <strong>Tour:</strong> {orderItem.tourTitle}
        </p>
        <p>
          <strong>Scheduled:</strong>{" "}
          {new Date(orderItem.scheduledAt).toLocaleString()}
        </p>
        <p>
          <strong>Participants:</strong> {orderItem.participants}
        </p>
        <p>
          <strong>Price Paid:</strong> €{orderItem.pricePaid.toFixed(2)}
        </p>
        <p>
          <strong>Payment Method:</strong> {orderItem.paymentMethod}
        </p>

        <p>
          <strong>Name:</strong> {orderItem.name}
        </p>
        <p>
          <strong>Email:</strong> {orderItem.email}
        </p>
        <p>
          <strong>Phone:</strong> {orderItem.phone}
        </p>
        {orderItem.nationality && (
          <p>
            <strong>Nationality:</strong> {orderItem.nationality}
          </p>
        )}
      </div>

      {/* Bottom row: View Tour + Close */}
      <div className="mt-6 flex justify-between gap-2">
        {tour && (
          <a
            href={`/items/${tour.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline flex-1"
          >
            View Tour
          </a>
        )}
        <button onClick={onClose} className="btn btn-primary flex-1">
          Close
        </button>
      </div>
    </Modal>
  );
}
