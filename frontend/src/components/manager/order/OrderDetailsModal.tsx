"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Tour, OrderItemResponseDto, OrderStatus } from "@/types";
import OwnershipModal from "./OwnerShipModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderItem: OrderItemResponseDto | null;
  tour?: Tour;
  onConfirm: (id: number) => void; // PENDING → CONFIRMED
  onConfirmCancellation: (id: number) => void; // CANCELLED → CANCELLED_CONFIRMED
  onComplete: (id: number) => void; // CONFIRMED → COMPLETED
  onReassigned: () => void; // callback to refresh the parent list after reassignment
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderItem,
  tour,
  onConfirm,
  onConfirmCancellation,
  onComplete,
  onReassigned,
}: Props) {
  const [isOwnershipModalOpen, setIsOwnershipModalOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  if (!orderItem) return null;

  const renderPrimaryAction = () => {
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
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Order Item #{orderItem.id}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Status: <span className="font-medium">{orderItem.status}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Assigned to:{" "}
            <span className="font-medium">
              {orderItem.managerName ?? "Unassigned"}
            </span>
          </p>
        </div>

        {/* Tour preview (kept from original) */}
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

        {/* Details (kept and expanded) */}
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

        {/* Footer row: left "View Tour", right Options + Primary Action + Close */}
        <div className="mt-6 flex items-center justify-between gap-2">
          <div></div>

          {/* Right group */}
          <div className="flex items-center gap-2 relative">
            {/* Options dropdown trigger */}
            <div className="relative">
              <button
                className="btn btn-sm"
                onClick={() => setOptionsOpen((v) => !v)}
              >
                Options
              </button>
              {optionsOpen && (
                <div className="absolute right-0 bottom-full mb-2 bg-base-100 border shadow-md rounded-lg z-30 w-44">
                  {tour && (
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-base-200"
                      onClick={() => {
                        setOptionsOpen(false);
                        window.open(`/items/${tour.id}`, "_blank");
                      }}
                    >
                      View Tour
                    </button>
                  )}
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-base-200"
                    onClick={() => {
                      setOptionsOpen(false);
                      setIsOwnershipModalOpen(true);
                    }}
                  >
                    Ownership
                  </button>
                </div>
              )}
            </div>

            {/* Primary action (Confirm / Confirm Cancellation / Completed) */}
            {renderPrimaryAction()}

            {/* Close */}
            <button className="btn btn-sm btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Ownership modal */}
      <OwnershipModal
        isOpen={isOwnershipModalOpen}
        onClose={() => setIsOwnershipModalOpen(false)}
        orderItemId={orderItem.id}
        currentManagerName={orderItem.managerName}
        shopId={orderItem.shopId}
        onReassigned={onReassigned}
      />
    </>
  );
}
