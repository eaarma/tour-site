"use client";

import { useEffect, useState } from "react";
import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { Tour } from "@/types";
import CardFrame from "@/components/common/CardFrame";
import { OrderService } from "@/lib/orderService";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import OrderItemCard from "../manager/order/OrderItemCard";
import OrderDetailsModal from "../manager/order/OrderDetailsModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "@/components/common/CustomDateInput";

interface Props {
  orderItems: OrderItemResponseDto[];
}

type SortOption = OrderStatus | "NONE" | "DATE_NEWEST" | "DATE_OLDEST";

const ACTIVE_STATUSES: (OrderStatus | "ALL")[] = [
  "ALL",
  "CONFIRMED",
  "PENDING",
];
const PAST_STATUSES: (OrderStatus | "ALL")[] = [
  "ALL",
  "COMPLETED",
  "CANCELLED_CONFIRMED",
  "CANCELLED",
];

export default function ManagerProfileOrderSection({ orderItems }: Props) {
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [items, setItems] = useState(orderItems);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [sortStatus, setSortStatus] = useState<SortOption>("NONE");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const { user } = useAuth();

  // ✅ Keep local items in sync with props
  useEffect(() => {
    setItems(orderItems);
  }, [orderItems]);

  const selectedItem = selectedItemId
    ? items.find((i) => i.id === selectedItemId) || null
    : null;

  const updateLocalItem = (updated: OrderItemResponseDto) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleConfirm = async (id: number) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }
    try {
      const updated = await OrderService.confirmOrderItem(id, user.id);
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

  // ✅ Filtering logic
  let filteredItems = items.filter((i) =>
    activeTab === "current"
      ? ["CONFIRMED", "PENDING"].includes(i.status)
      : ["COMPLETED", "CANCELLED", "CANCELLED_CONFIRMED"].includes(i.status)
  );

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

  // ✅ Sorting logic
  filteredItems = [...filteredItems].sort((a, b) => {
    // sort by date if selected
    if (sortStatus === "DATE_NEWEST") {
      return (
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
    }
    if (sortStatus === "DATE_OLDEST") {
      return (
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }

    // sort by a specific status
    if (sortStatus !== "NONE") {
      if (a.status === sortStatus && b.status !== sortStatus) return -1;
      if (b.status === sortStatus && a.status !== sortStatus) return 1;
    }

    // default sort by newest date
    return (
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  });

  const statusOptions =
    activeTab === "current" ? ACTIVE_STATUSES : PAST_STATUSES;

  return (
    <section className="mb-2">
      <CardFrame>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Your Orders</h2>

          {/* Tabs */}
          <div role="tablist" className="tabs tabs-boxed mb-3">
            <button
              className={`tab ${activeTab === "current" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("current")}
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

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center mb-3">
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
              onChange={(e) => setSortStatus(e.target.value as SortOption)}
            >
              <option value="NONE">No sorting</option>
              <option value="DATE_NEWEST">Sort by date (newest first)</option>
              <option value="DATE_OLDEST">Sort by date (oldest first)</option>
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
          <div className="flex gap-4 items-center mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">From:</label>
              <DatePicker
                selected={fromDate}
                onChange={(d) => setFromDate(d)}
                dateFormat="yyyy-MM-dd"
                customInput={
                  <CustomDateInput
                    value={fromDate ? fromDate.toLocaleDateString("en-GB") : ""}
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

          {/* Orders list */}
          <div className="space-y-3 min-h-[370px] max-h-[370px] overflow-y-auto pr-2">
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
              <p className="text-sm text-gray-500">No orders to display.</p>
            )}
          </div>

          {/* Modal */}
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
