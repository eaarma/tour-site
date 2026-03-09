"use client";

import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "@/components/common/CustomDateInput";
import {
  OrderItemCardDto,
  OrderItemResponseDto,
  OrderStatus,
} from "@/types/order";
import { OrderService } from "@/lib/orderService";
import toast from "react-hot-toast";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderItemCard from "./OrderItemCard";
import { useSessionManager } from "@/hooks/useSessionManager";
import SessionDetailsModal from "../session/SessionDetailsModal";

const ACTIVE_STATUSES = ["PAID", "CONFIRMED", "PENDING"];

const PAST_STATUSES = [
  "FAILED",
  "EXPIRED",
  "CANCELLED",
  "COMPLETED",
  "CANCELLED_CONFIRMED",
];

const ALL_STATUSES: OrderItemCardDto["status"][] = [
  "PENDING",
  "PAID",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
  "EXPIRED",
  "CANCELLED_CONFIRMED",
];

type SortOption = "DATE" | "STATUS";

interface Props {
  shopId: number;
}

export default function ManagerOrderSection({ shopId }: Props) {
  const [orderItems, setOrderItems] = useState<OrderItemResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("DATE");
  const [statusFilter, setStatusFilter] = useState<
    OrderItemResponseDto["status"][]
  >([]);

  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);

  const [selectedOrder, setSelectedOrder] =
    useState<OrderItemResponseDto | null>(null);

  const {
    sessionList,
    selectedSessionId,
    setSelectedSessionId,
    confirmSession,
    completeSession,
    updateLocalSession,
  } = useSessionManager(shopId);

  const handleViewSession = (sessionId: number) => {
    setSelectedOrder(null);
    setSelectedSessionId(sessionId);
  };

  // 🔹 Fetch orders
  const loadOrders = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const data = await OrderService.getItemsByShopId(shopId);
      console.log(data.map((o) => o.status));
      setOrderItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [shopId]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!statusFilterOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!statusFilterRef.current?.contains(e.target as Node)) {
        setStatusFilterOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [statusFilterOpen]);

  // =========================
  // Filtering logic
  // =========================

  let filtered = [...orderItems];

  // Tab filter
  if (activeTab === "active") {
    filtered = filtered.filter((o) => ACTIVE_STATUSES.includes(o.status));
  }

  if (activeTab === "past") {
    filtered = filtered.filter((o) => PAST_STATUSES.includes(o.status));
  }

  // Date range
  if (fromDate) {
    filtered = filtered.filter((o) => new Date(o.scheduledAt) >= fromDate);
  }

  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((o) => new Date(o.scheduledAt) <= end);
  }

  // Status filter
  if (statusFilter.length > 0) {
    filtered = filtered.filter((o) => statusFilter.includes(o.status));
  }

  // Sorting
  if (sortBy === "DATE") {
    filtered.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  }

  if (sortBy === "STATUS") {
    filtered.sort((a, b) => a.status.localeCompare(b.status));
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Orders</h2>
        <p className="text-sm text-muted-foreground">
          View and filter all order items for this shop.
        </p>
      </div>

      {/* ================= TAB TOGGLE ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "active"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "past"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* From Date */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">From</span>
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

          {/* To Date */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">To</span>
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

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Sort</label>
            <select
              className="select  select-sm w-full sm:w-auto h-10
                hover:border-border hover:outline-none hover:ring-2 hover:ring-ring/30 hover:ring-primary/20
                focus:border-border focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="DATE">Sort by date</option>
              <option value="STATUS">Sort by status</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <select
              className="select  select-sm w-full sm:w-auto h-10
                hover:border-border hover:outline-none hover:ring-2 hover:ring-ring/30 hover:ring-primary/20
                focus:border-border focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-primary"
              value={statusFilter[0] ?? ""}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value ? [e.target.value as OrderStatus] : [],
                )
              }
            >
              <option value="">All statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              type="button"
              className="btn btn-sm btn-outline w-full h-10 hover:border-primary hover:text-primary transition-colors"
              onClick={() => {
                setFromDate(null);
                setToDate(null);
                setStatusFilter([]);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
            <p className="text-muted-foreground">No orders to display.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filtered.map((item) => (
              <OrderItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedOrder(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          orderItem={selectedOrder}
          onViewSession={handleViewSession}
        />
      )}

      {selectedSessionId && (
        <SessionDetailsModal
          session={sessionList.find((s) => s.id === selectedSessionId)!}
          onClose={() => setSelectedSessionId(null)}
          onConfirmSession={confirmSession}
          onCompleteSession={completeSession}
          onSessionUpdated={updateLocalSession}
        />
      )}
    </div>
  );
}
