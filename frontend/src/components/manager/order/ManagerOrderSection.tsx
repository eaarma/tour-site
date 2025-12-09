"use client";

import { useEffect, useState } from "react";
import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { Tour } from "@/types";
import CardFrame from "@/components/common/CardFrame";
import OrderItemCard from "./OrderItemCard";
import OrderDetailsModal from "./OrderDetailsModal";
import { OrderService } from "@/lib/orderService";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "@/components/common/CustomDateInput";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  orderItems: OrderItemResponseDto[];
  tours: Tour[];
}

const ACTIVE_STATUSES: (OrderStatus | "ALL")[] = [
  "ALL",
  "CONFIRMED",
  "PENDING",
  "CANCELLED",
];
const PAST_STATUSES: (OrderStatus | "ALL")[] = [
  "ALL",
  "COMPLETED",
  "CANCELLED_CONFIRMED",
];

export default function ManagerOrderSection({ orderItems, tours }: Props) {
  const [activeTab, setActiveTab] = useState<"today" | "active" | "past">(
    "today"
  );
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [items, setItems] = useState(orderItems);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [sortStatus, setSortStatus] = useState<OrderStatus | "NONE">("NONE");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    setItems(orderItems);
  }, [orderItems]);

  const selectedItem = selectedItemId
    ? items.find((i) => i.id === selectedItemId) || null
    : null;

  const updateLocalItem = (updated: OrderItemResponseDto) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const refreshAfterReassign = async (itemId: number) => {
    try {
      const updated = await OrderService.getOrderItemById(itemId);
      updateLocalItem(updated);
    } catch {
      toast.error("Failed to refresh item");
    }
  };

  const handleConfirm = async (id: number) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const updated = await OrderService.confirmOrderItem(id, user.id);
      updateLocalItem(updated);
      toast.success("Order confirmed and assigned ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm order");
    }
  };

  const handleConfirmCancellation = async (id: number) => {
    try {
      const updated = await OrderService.updateItemStatus(
        id,
        "CANCELLED_CONFIRMED"
      );
      updateLocalItem(updated);
      toast.success("Cancellation confirmed 🚫");
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm cancellation");
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const updated = await OrderService.updateItemStatus(id, "COMPLETED");
      updateLocalItem(updated);
      toast.success("Order marked as completed 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as completed");
    }
  };

  // ✅ Filtering + Sorting logic (same as before)
  let filteredItems = items;

  // today
  if (activeTab === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    filteredItems = filteredItems.filter((i) => {
      const dt = new Date(i.scheduledAt);
      return dt >= today && dt < tomorrow;
    });
  }

  // active
  if (activeTab === "active") {
    filteredItems = filteredItems.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }

  // past
  if (activeTab === "past") {
    filteredItems = filteredItems.filter(
      (i) => i.status === "COMPLETED" || i.status === "CANCELLED_CONFIRMED"
    );
  }
  if (filterStatus !== "ALL") {
    filteredItems = filteredItems.filter((i) => i.status === filterStatus);
  }
  if (fromDate) {
    const fromStart = new Date(fromDate);
    fromStart.setHours(0, 0, 0, 0);
    filteredItems = filteredItems.filter(
      (i) => new Date(i.scheduledAt) >= fromStart
    );
  }
  if (toDate) {
    const toEnd = new Date(toDate);
    toEnd.setHours(23, 59, 59, 999);
    filteredItems = filteredItems.filter(
      (i) => new Date(i.scheduledAt) <= toEnd
    );
  }
  if (sortStatus !== "NONE") {
    filteredItems = [...filteredItems].sort((a, b) => {
      if (a.status === sortStatus && b.status !== sortStatus) return -1;
      if (b.status === sortStatus && a.status !== sortStatus) return 1;
      return 0;
    });
  }

  const statusOptions =
    activeTab === "active" ? ACTIVE_STATUSES : PAST_STATUSES;

  return (
    <section className="mb-12">
      <CardFrame>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>

          {/* Filters + Tabs (same logic) */}
          <div className="sticky top-0 z-10 bg-base-200 pb-3">
            <div className="tabs tabs-boxed mb-3">
              <button
                className={`tab ${activeTab === "today" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("today")}
              >
                Today
              </button>
              <button
                className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("active")}
              >
                Active
              </button>
              <button
                className={`tab ${activeTab === "past" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("past")}
              >
                Past
              </button>
            </div>

            <div className="flex flex-wrap gap-4 items-center mb-2">
              <select
                className="select select-bordered select-sm"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as OrderStatus | "ALL")
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL"
                      ? "All statuses"
                      : status === "CANCELLED_CONFIRMED"
                      ? "CANCELLED"
                      : status}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered select-sm"
                value={sortStatus}
                onChange={(e) =>
                  setSortStatus(e.target.value as OrderStatus | "NONE")
                }
              >
                <option value="NONE">No sorting</option>
                {statusOptions
                  .filter((s) => s !== "ALL")
                  .map((status) => (
                    <option key={status} value={status}>
                      Sort by {status}
                    </option>
                  ))}
              </select>
            </div>

            {/* Date pickers */}
            <div className="flex gap-4 items-center mb-2 mt-2">
              <div className="flex items-center gap-2">
                <label className="text-sm">From:</label>
                <DatePicker
                  selected={fromDate}
                  onChange={(d) => setFromDate(d)}
                  dateFormat="yyyy-MM-dd"
                  customInput={
                    <CustomDateInput
                      value={
                        fromDate ? fromDate.toLocaleDateString("en-GB") : ""
                      }
                      onClear={() => setFromDate(null)}
                    />
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">To:</label>
                <DatePicker
                  selected={toDate}
                  onChange={(d) => setToDate(d)}
                  dateFormat="yyyy-MM-dd"
                  customInput={
                    <CustomDateInput
                      value={toDate ? toDate.toLocaleDateString("en-GB") : ""}
                      onClear={() => setToDate(null)}
                    />
                  }
                />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3 min-h-[465px] max-h-[465px] overflow-y-auto pr-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <OrderItemCard
                  key={item.id}
                  item={item}
                  onConfirm={handleConfirm}
                  onConfirmCancellation={handleConfirmCancellation}
                  onComplete={handleComplete}
                  onClick={() => setSelectedItemId(item.id)}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No bookings to display.</p>
            )}
          </div>

          {/* Details modal */}
          <OrderDetailsModal
            isOpen={!!selectedItem}
            onClose={() => setSelectedItemId(null)}
            orderItem={selectedItem}
            tour={
              selectedItem
                ? tours.find((t) => t.id === selectedItem.tourId)
                : undefined
            }
            onConfirm={handleConfirm}
            onConfirmCancellation={handleConfirmCancellation}
            onComplete={handleComplete}
            onReassigned={() =>
              selectedItem && refreshAfterReassign(selectedItem.id)
            }
          />
        </div>
      </CardFrame>
    </section>
  );
}
