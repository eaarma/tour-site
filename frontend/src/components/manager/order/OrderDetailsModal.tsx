"use client";

import Modal from "@/components/common/Modal";
import { Tour, OrderItemResponseDto } from "@/types";
import {
  Users,
  Calendar,
  CreditCard,
  User,
  Mail,
  Phone,
  Globe,
  BadgeCheck,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderItem: OrderItemResponseDto | null;
  tour?: Tour;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderItem,
  tour,
}: Props) {
  if (!orderItem) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* ===== HEADER ===== */}
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-800">
          Booking #{orderItem.id}
        </h2>

        <div className="mt-1 inline-flex items-center gap-2 text-sm">
          <BadgeCheck className="w-4 h-4 text-primary" />
          <span className="font-medium text-gray-700">{orderItem.status}</span>
        </div>
      </div>

      {/* ===== TOUR PREVIEW ===== */}
      {tour && (
        <div className="mb-5">
          {tour.image && (
            <img
              src={tour.image}
              alt={tour.title}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
          )}
          <h3 className="text-lg font-semibold text-gray-800">{tour.title}</h3>
          {tour.location && (
            <p className="text-sm text-gray-500">{tour.location}</p>
          )}
        </div>
      )}

      {/* ===== BOOKING DETAILS ===== */}
      <div className="space-y-2 text-sm mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span>
            <strong>Participants:</strong> {orderItem.participants}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <span>
            <strong>Price Paid:</strong> €{orderItem.pricePaid.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>
            <strong>Scheduled:</strong>{" "}
            {new Date(orderItem.scheduledAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ===== CUSTOMER INFO ===== */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <p className="font-semibold text-gray-700 mb-2">Customer Information</p>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span>
            <strong>Name:</strong> {orderItem.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span>
            <strong>Email:</strong> {orderItem.email}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <span>
            <strong>Phone:</strong> {orderItem.phone}
          </span>
        </div>

        {orderItem.nationality && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span>
              <strong>Nationality:</strong> {orderItem.nationality}
            </span>
          </div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-6 flex justify-end">
        <button className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
