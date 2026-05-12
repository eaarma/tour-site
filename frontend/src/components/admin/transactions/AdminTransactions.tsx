"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { PaymentLineService } from "@/lib/payments/paymentLineService";
import { PaymentLineResponseDto, PaymentStatus } from "@/types/paymentLine";
import CustomDateInput from "../../common/CustomDateInput";
import Pagination from "../../common/Pagination";
import AdminTransactionModal from "./AdminTransactionModal";

const PAYMENT_STATUS_OPTIONS = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const satisfies readonly PaymentStatus[];

type PaymentStatusFilter = "" | PaymentStatus;

const getStatusDotClass = (status: PaymentStatus) => {
  switch (status) {
    case "SUCCEEDED":
      return "bg-green-500";
    case "PENDING":
      return "bg-yellow-500";
    case "FAILED":
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
};

const formatCurrency = (value?: number, currency = "EUR") => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)} ${currency}`;
};

const toDateParam = (value: Date | null) => {
  if (!value) return undefined;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const renderReference = (line: PaymentLineResponseDto) => {
  if (line.orderItemId) {
    return (
      <div>
        <div>Order #{line.orderId ?? "-"}</div>
        <div className="text-xs opacity-60">Item #{line.orderItemId}</div>
      </div>
    );
  }

  if (line.sessionId) {
    return <>Session #{line.sessionId}</>;
  }

  return "-";
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<PaymentLineResponseDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<PaymentStatusFilter>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentLineResponseDto | null>(null);

  const hasLoaded = useRef(false);
  const requestRef = useRef({ query, fromDate, toDate, status, page });

  requestRef.current = { query, fromDate, toDate, status, page };

  const fetchTransactions = useCallback(async (initial = false) => {
    const currentRequest = requestRef.current;

    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const data = await PaymentLineService.getAdminPage({
        query: currentRequest.query || undefined,
        from: toDateParam(currentRequest.fromDate),
        to: toDateParam(currentRequest.toDate),
        status: currentRequest.status || undefined,
        page: currentRequest.page,
        size: 10,
      });

      setTransactions(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(true).finally(() => {
      hasLoaded.current = true;
    });
  }, [fetchTransactions]);

  useEffect(() => {
    if (!hasLoaded.current) return;

    const timeout = setTimeout(() => {
      fetchTransactions(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchTransactions, fromDate, page, query, status, toDate]);

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
    return <div className="card bg-base-100 p-6">Loading transactions...</div>;
  }

  return (
    <div className="card max-w-full overflow-hidden bg-base-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transaction Management</h2>
        {refreshing && (
          <span className="text-sm opacity-70">Refreshing...</span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Search</span>
          <input
            type="text"
            placeholder="Search by shop ID..."
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
              setStatus(e.target.value as PaymentStatusFilter);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            {PAYMENT_STATUS_OPTIONS.map((paymentStatus) => (
              <option key={paymentStatus} value={paymentStatus}>
                {paymentStatus}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Type</th>
              <th className="min-w-[150px]">Reference</th>
              <th className="min-w-[170px]">Tour</th>
              <th>Created</th>
              <th>Gross</th>
              <th>Shop Amount</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-base-content/60"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${getStatusDotClass(
                        transaction.status,
                      )}`}
                      title={transaction.status}
                    />
                  </td>
                  <td>{transaction.type}</td>
                  <td>{renderReference(transaction)}</td>
                  <td className="min-w-[170px]">
                    {transaction.tourTitle || "-"}
                  </td>
                  <td>{formatDateTime(transaction.createdAt)}</td>
                  <td>
                    {formatCurrency(
                      transaction.grossAmount,
                      transaction.currency,
                    )}
                  </td>
                  <td>
                    {formatCurrency(
                      transaction.shopAmount,
                      transaction.currency,
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => setSelectedTransaction(transaction)}
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selectedTransaction && (
        <AdminTransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
