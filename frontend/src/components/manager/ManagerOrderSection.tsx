"use client";

import { useState } from "react";
import Image from "next/image";
import OrderDetailsModal from "./OrderDetailsModal";
import { OrderResponseDto } from "@/types";
import { Item } from "@/types";

interface ManagerOrderSectionProps {
  orders: OrderResponseDto[];
  tours: Item[];
}

export default function ManagerOrderSection({
  orders,
  tours,
}: ManagerOrderSectionProps) {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(
    null
  );

  const handleConfirm = (id: string) => {
    // Optionally implement API call to confirm order here
  };

  const renderOrderCard = (order: OrderResponseDto) => {
    const tour = tours.find((t) => t.id === order.tourId);

    return (
      <div
        key={order.id}
        className="card bg-base-100 shadow-md border flex flex-col md:flex-row gap-4 p-4 items-center cursor-pointer hover:shadow-lg transition"
        onClick={() => setSelectedOrder(order)}
      >
        {tour && (
          <div className="relative w-24 h-24 rounded-md overflow-hidden">
            {/* <Image
              src={tour.imageUrl}
              alt={tour.title}
              fill
              className="object-cover"
            /> */}
          </div>
        )}

        <div className="flex-1 w-full">
          <h3 className="text-lg font-semibold">Order #{order.id}</h3>
          {tour && <p className="text-sm">{tour.title}</p>}
          <p className="text-sm text-base-content/70">
            {new Date(order.scheduledAt).toLocaleString()}
          </p>
          <p className="mt-1 text-sm font-medium">
            Status:{" "}
            <span
              className={`badge ${
                order.status === "CONFIRMED"
                  ? "badge-success"
                  : order.status === "PENDING"
                  ? "badge-warning"
                  : "badge-error"
              }`}
            >
              {order.status}
            </span>
          </p>
        </div>

        {order.status !== "CONFIRMED" && (
          <button
            className="btn btn-sm btn-primary mt-2 md:mt-0"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm(order.id);
            }}
          >
            Confirm
          </button>
        )}
      </div>
    );
  };

  const selectedTour = selectedOrder
    ? tours.find((t) => t.id === selectedOrder.tourId) || null
    : null;

  const filteredOrders = orders.filter((o) =>
    activeTab === "active" ? o.status !== "COMPLETED" : o.status === "COMPLETED"
  );

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>

      <div role="tablist" className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("active")}
          role="tab"
        >
          Active
        </button>
        <button
          className={`tab ${activeTab === "past" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("past")}
          role="tab"
        >
          Past
        </button>
      </div>

      <div className="space-y-4">{filteredOrders.map(renderOrderCard)}</div>

      {/* Modal */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        tour={selectedTour}
      />
    </section>
  );
}
