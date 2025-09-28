"use client";

import { useState } from "react";
import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { Item } from "@/types";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderItemCard from "./item/OrderItemCard";

interface Props {
  orderItems: OrderItemResponseDto[];
  tours: Item[];
}

const STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "PENDING",
  "CANCELLED",
  "COMPLETED",
];

export default function ManagerOrderSection({ orderItems, tours }: Props) {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [selectedItem, setSelectedItem] = useState<OrderItemResponseDto | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [sortStatus, setSortStatus] = useState<OrderStatus | "NONE">("NONE");

  const handleConfirm = async (id: number) => {
    console.log("Confirm order item:", id);
    // TODO: API call
  };

  // ✅ filter by active/past
  let filteredItems = orderItems.filter((i) =>
    activeTab === "active" ? i.status !== "COMPLETED" : i.status === "COMPLETED"
  );

  // ✅ apply status filter
  if (filterStatus !== "ALL") {
    filteredItems = filteredItems.filter((i) => i.status === filterStatus);
  }

  // ✅ apply sorting by status
  if (sortStatus !== "NONE") {
    filteredItems = [...filteredItems].sort((a, b) => {
      if (a.status === sortStatus && b.status !== sortStatus) return -1;
      if (b.status === sortStatus && a.status !== sortStatus) return 1;
      return 0;
    });
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>

      {/* Sticky controls */}
      <div className="sticky top-0 z-10 bg-base-200 pb-2">
        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed mb-3">
          <button
            className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Current
          </button>
          <button
            className={`tab ${activeTab === "past" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past
          </button>
        </div>

        {/* Filters & Sort */}
        <div className="flex gap-4 items-center mb-2">
          {/* Filter dropdown */}
          <select
            className="select select-bordered select-sm"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as OrderStatus | "ALL")
            }
          >
            <option value="ALL">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Sort dropdown */}
          <select
            className="select select-bordered select-sm"
            value={sortStatus}
            onChange={(e) =>
              setSortStatus(e.target.value as OrderStatus | "NONE")
            }
          >
            <option value="NONE">No sorting</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                Sort by {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable list */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2">
          {filteredItems.map((item) => (
            <OrderItemCard
              key={item.id}
              item={item}
              tour={tours.find((t) => t.id === item.tourId)}
              onConfirm={handleConfirm}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No bookings to display.</p>
      )}

      <OrderDetailsModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        orderItem={selectedItem}
      />
    </section>
  );
}
