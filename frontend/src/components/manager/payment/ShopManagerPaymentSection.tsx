"use client";

import { useEffect, useMemo, useState } from "react";
import { PaymentLineResponseDto } from "@/types/paymentLine";
import { PaymentLineService } from "@/lib/paymentLineService";
import PaymentSectionRow from "./PaymentSectionRow";
import DatePicker from "react-datepicker";
import CustomDateInput from "@/components/common/CustomDateInput";
import { OrderService } from "@/lib/orderService";
import OrderDetailsModal from "../order/OrderDetailsModal";
import { OrderDetailsModalDto } from "@/types";
import { useSessionManager } from "@/hooks/useSessionManager";
import SessionDetailsModal from "../session/SessionDetailsModal";

interface Props {
  shopId: number;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function ShopManagerPaymentSection({ shopId }: Props) {
  const [payments, setPayments] = useState<PaymentLineResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] =
    useState<OrderDetailsModalDto | null>(null);

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    new Date().getMonth(),
  );
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const {
    sessionList,
    selectedSessionId,
    setSelectedSessionId,
    confirmSession,
    completeSession,
    updateLocalSession,
  } = useSessionManager(shopId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await PaymentLineService.getByShopId(shopId);
      setPayments(data);
      setLoading(false);
    };
    load();
  }, [shopId]);

  useEffect(() => {
    if (fromDate || toDate) {
      setSelectedMonth(null); // null = All months
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (fromDate) {
      setSelectedYear(fromDate.getFullYear());
    }
  }, [fromDate]);

  const handleViewPayment = async (payment: PaymentLineResponseDto) => {
    try {
      const item = await OrderService.getShopOrderItemById(payment.orderItemId);

      if (!item) return;

      setSelectedOrder(item);
    } catch (err) {
      console.error("Failed to load order details", err);
    }
  };

  // ============================
  // Filtering logic
  // ============================
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const date = new Date(p.createdAt);

      if (selectedYear && date.getFullYear() !== selectedYear) return false;

      if (selectedMonth !== null && date.getMonth() !== selectedMonth)
        return false;

      if (fromDate && date < fromDate) return false;

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }

      return true;
    });
  }, [payments, selectedYear, selectedMonth, fromDate, toDate]);

  const totalGross = filtered.reduce((s, p) => s + p.grossAmount, 0);
  const totalPlatform = filtered.reduce((s, p) => s + p.platformFee, 0);
  const totalShop = filtered.reduce((s, p) => s + p.shopAmount, 0);

  const availableYears = Array.from(
    new Set(payments.map((p) => new Date(p.createdAt).getFullYear())),
  ).sort((a, b) => b - a);

  const handleMonthSelect = (month: number | null) => {
    setSelectedMonth(month);
    setFromDate(null);
    setToDate(null);
  };

  if (loading) return <div className="p-6">Loading payments...</div>;

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold">Payments</h2>
        <p className="text-sm text-muted-foreground">
          Overview of incoming payments and platform fees.
        </p>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm space-y-4">
        {/* Year + Month */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <select
            className="select select-sm select-bordered w-32"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Month pills */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedMonth === null
                  ? "bg-primary text-white"
                  : "bg-base-200 hover:bg-base-300"
              }`}
              onClick={() => handleMonthSelect(null)}
            >
              All
            </button>

            {MONTHS.map((m, index) => (
              <button
                key={m}
                onClick={() => handleMonthSelect(index)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedMonth === index
                    ? "bg-primary text-white"
                    : "bg-base-200 hover:bg-base-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Custom range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">From</label>
            <DatePicker
              selected={fromDate}
              onChange={(d) => setFromDate(d)}
              customInput={
                <CustomDateInput
                  value={fromDate ? fromDate.toLocaleDateString("en-GB") : ""}
                  onClear={() => setFromDate(null)}
                />
              }
            />
          </div>

          {/* To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">To</label>
            <DatePicker
              selected={toDate}
              onChange={(d) => setToDate(d)}
              customInput={
                <CustomDateInput
                  value={toDate ? toDate.toLocaleDateString("en-GB") : ""}
                  onClear={() => setToDate(null)}
                />
              }
            />
          </div>

          {/* Clear */}
          <div className="flex items-end">
            <button
              className="btn btn-sm btn-outline w-full"
              onClick={() => {
                setSelectedMonth(new Date().getMonth());
                setFromDate(null);
                setToDate(null);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-base-100 shadow-sm">
          <p className="text-sm text-muted-foreground">Gross</p>
          <p className="text-xl font-semibold">€{totalGross.toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-xl border bg-base-100 shadow-sm">
          <p className="text-sm text-muted-foreground">Platform Fees</p>
          <p className="text-xl font-semibold">€{totalPlatform.toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-xl border bg-base-100 shadow-sm">
          <p className="text-sm text-muted-foreground">You Receive</p>
          <p className="text-xl font-semibold text-green-600">
            €{totalShop.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No payments found.
          </div>
        ) : (
          <div className="max-h-[350px] sm:max-h-[500px] overflow-y-auto divide-y divide-base-200">
            {filtered.map((p) => (
              <PaymentSectionRow
                key={p.id}
                payment={p}
                onView={handleViewPayment}
              />
            ))}
          </div>
        )}

        {selectedOrder && (
          <OrderDetailsModal
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            orderItem={selectedOrder}
            onViewSession={(sessionId) => {
              setSelectedOrder(null);
              setSelectedSessionId(sessionId);
            }}
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
    </div>
  );
}
