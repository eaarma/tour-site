"use client";

import { useState } from "react";
import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { Item } from "@/types";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderItemCard from "./item/OrderItemCard";
import { OrderService } from "@/lib/orderService";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "../common/CustomDateInput";
import CardFrame from "../common/cardFrame";

interface Props {
  orderItems: OrderItemResponseDto[];
  tours: Item[];
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
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [items, setItems] = useState(orderItems);

  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [sortStatus, setSortStatus] = useState<OrderStatus | "NONE">("NONE");

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const resetFiltersAndDates = () => {
    setFilterStatus("ALL");
    setSortStatus("NONE");
    setFromDate(null);
    setToDate(null);
  };

  const updateLocalItem = (updated: OrderItemResponseDto) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleConfirm = async (id: number) => {
    try {
      const updated = await OrderService.updateItemStatus(id, "CONFIRMED");
      updateLocalItem(updated);
      toast.success("Order confirmed ✅");
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

  // ✅ Base filter: active vs past
  let filteredItems = items.filter((i) =>
    activeTab === "active"
      ? i.status !== "COMPLETED" && i.status !== "CANCELLED_CONFIRMED"
      : i.status === "COMPLETED" || i.status === "CANCELLED_CONFIRMED"
  );

  // ✅ Status filter
  if (filterStatus !== "ALL") {
    filteredItems = filteredItems.filter((i) => i.status === filterStatus);
  }

  // ✅ Date range filter (full-day inclusive)
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

  // ✅ Sorting
  if (sortStatus !== "NONE") {
    filteredItems = [...filteredItems].sort((a, b) => {
      if (a.status === sortStatus && b.status !== sortStatus) return -1;
      if (b.status === sortStatus && a.status !== sortStatus) return 1;
      return 0;
    });
  }

  const statusOptions =
    activeTab === "active" ? ACTIVE_STATUSES : PAST_STATUSES;

  // 🔹 Always pull the latest item for modal
  const selectedItem = selectedItemId
    ? items.find((i) => i.id === selectedItemId) || null
    : null;

  return (
    <section className="mb-12">
      <CardFrame>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>

          {/* Sticky controls */}
          <div className="sticky top-0 z-10 bg-base-200 pb-3">
            {/* Tabs */}
            <div role="tablist" className="tabs tabs-boxed mb-3">
              <button
                className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
                onClick={() => {
                  setActiveTab("active");
                  resetFiltersAndDates();
                }}
              >
                Current
              </button>
              <button
                className={`tab ${activeTab === "past" ? "tab-active" : ""}`}
                onClick={() => {
                  setActiveTab("past");
                  resetFiltersAndDates();
                }}
              >
                Past
              </button>
            </div>

            {/* Filters row */}
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

            {/* Date pickers row */}
            <div className="flex gap-4 items-center mb-2 mt-2">
              <div className="flex items-center gap-2">
                <label className="text-sm">From:</label>
                <DatePicker
                  selected={fromDate}
                  onChange={(d) => setFromDate(d)}
                  dateFormat="yyyy-MM-dd"
                  calendarStartDay={1}
                  showPopperArrow={false}
                  shouldCloseOnSelect
                  preventOpenOnFocus
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
                  calendarStartDay={1}
                  showPopperArrow={false}
                  shouldCloseOnSelect
                  preventOpenOnFocus
                  customInput={
                    <CustomDateInput
                      value={toDate ? toDate.toLocaleDateString("en-GB") : ""}
                      onClear={() => setToDate(null)}
                    />
                  }
                />
              </div>

              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
              >
                Clear Dates
              </button>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="space-y-3 min-h-[465px] max-h-[465px] overflow-y-auto pr-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <OrderItemCard
                  key={item.id}
                  item={item}
                  tour={tours.find((t) => t.id === item.tourId)}
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

          {/* Modal always uses latest item */}
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
          />
        </div>
      </CardFrame>
    </section>
  );
}
