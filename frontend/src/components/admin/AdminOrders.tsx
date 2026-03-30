"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { OrderService } from "@/lib/orderService";
import { OrderResponseDto, OrderStatus } from "@/types/order";
import toast from "react-hot-toast";
import Pagination from "../common/Pagination";
import CustomDateInput from "../common/CustomDateInput";
import AdminOrderModal from "./AdminOrderModal";

const ORDER_STATUS_OPTIONS = [
  "RESERVED",
  "EXPIRED",
  "FINALIZED",
  "PENDING",
  "PLANNED",
  "PAID",
  "PARTIALLY_PAID",
  "CONFIRMED",
  "CANCELLED",
  "CANCELLED_CONFIRMED",
  "PARTIALLY_CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "COMPLETED",
  "FAILED",
] as const satisfies readonly OrderStatus[];

type OrderStatusFilter = "" | OrderStatus;

const getStatusDotClass = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
    case "CONFIRMED":
    case "COMPLETED":
      return "bg-green-500";
    case "RESERVED":
    case "FINALIZED":
    case "PENDING":
    case "PLANNED":
    case "PARTIALLY_PAID":
      return "bg-yellow-500";
    case "CANCELLED":
    case "CANCELLED_CONFIRMED":
    case "PARTIALLY_CANCELLED":
    case "FAILED":
    case "EXPIRED":
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
};

const toDateParam = (value: Date | null) => {
  if (!value) return undefined;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<OrderStatusFilter>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(
    null,
  );

  const hasLoaded = useRef(false);
  const requestRef = useRef({ query, fromDate, toDate, status, page });

  requestRef.current = { query, fromDate, toDate, status, page };

  const fetchOrders = useCallback(async (initial = false) => {
    const currentRequest = requestRef.current;

    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const data = await OrderService.getAdminPage({
        query: currentRequest.query || undefined,
        from: toDateParam(currentRequest.fromDate),
        to: toDateParam(currentRequest.toDate),
        status: currentRequest.status || undefined,
        page: currentRequest.page,
        size: 10,
      });

      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true).finally(() => {
      hasLoaded.current = true;
    });
  }, [fetchOrders]);

  useEffect(() => {
    if (!hasLoaded.current) return;

    const timeout = setTimeout(() => {
      fetchOrders(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchOrders, fromDate, page, query, status, toDate]);

  useEffect(() => {
    if (totalPages === 0 && page !== 0) {
      setPage(0);
      return;
    }

    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  if (loading) {
    return <div className="card bg-base-100 p-6">Loading orders...</div>;
  }

  return (
    <div className="card bg-base-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Order Management</h2>
        {refreshing && (
          <span className="text-sm opacity-70">Refreshing...</span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Search</span>
          <input
            type="text"
            placeholder="Search by order ID..."
            className="input input-bordered w-full"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">From</span>
          <DatePicker
            selected={fromDate}
            onChange={(date) => {
              setFromDate(date);
              setPage(0);
            }}
            dateFormat="yyyy-MM-dd"
            maxDate={toDate || undefined}
            customInput={
              <CustomDateInput
                value={fromDate ? fromDate.toLocaleDateString("en-GB") : ""}
                onClear={() => {
                  setFromDate(null);
                  setPage(0);
                }}
              />
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">To</span>
          <DatePicker
            selected={toDate}
            onChange={(date) => {
              setToDate(date);
              setPage(0);
            }}
            dateFormat="yyyy-MM-dd"
            minDate={fromDate || undefined}
            customInput={
              <CustomDateInput
                value={toDate ? toDate.toLocaleDateString("en-GB") : ""}
                onClear={() => {
                  setToDate(null);
                  setPage(0);
                }}
              />
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Status</span>
          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatusFilter);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            {ORDER_STATUS_OPTIONS.map((orderStatus) => (
              <option key={orderStatus} value={orderStatus}>
                {orderStatus}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>ID</th>
              <th>Items</th>
              <th>Created</th>
              <th>Total</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center opacity-70">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${getStatusDotClass(
                        order.status,
                      )}`}
                      title={order.status}
                    />
                  </td>
                  <td>{order.id}</td>
                  <td>{order.items.length}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.totalPrice} EUR</td>
                  <td className="text-right">
                    <button
                      className="btn btn-sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedOrder && (
        <AdminOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
