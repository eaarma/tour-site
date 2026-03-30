"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import CustomDateInput from "../common/CustomDateInput";
import Pagination from "../common/Pagination";
import AdminSessionModal from "./AdminSessionModal";
import { TourSessionService } from "@/lib/tourSessionService";
import { SessionStatus, TourSessionDto } from "@/types/tourSession";

const SESSION_STATUS_OPTIONS = [
  "PENDING",
  "EXPIRED",
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
] as const satisfies readonly SessionStatus[];

type SessionStatusFilter = "" | SessionStatus;

const getStatusDotClass = (status: SessionStatus) => {
  switch (status) {
    case "PAID":
    case "CONFIRMED":
    case "COMPLETED":
      return "bg-green-500";
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

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  return value.slice(0, 5);
};

const toDateParam = (value: Date | null) => {
  if (!value) return undefined;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState<TourSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<SessionStatusFilter>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedSession, setSelectedSession] = useState<TourSessionDto | null>(
    null,
  );

  const hasLoaded = useRef(false);
  const requestRef = useRef({ query, fromDate, toDate, status, page });

  requestRef.current = { query, fromDate, toDate, status, page };

  const fetchSessions = useCallback(async (initial = false) => {
    const currentRequest = requestRef.current;

    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const data = await TourSessionService.getAdminPage({
        query: currentRequest.query || undefined,
        from: toDateParam(currentRequest.fromDate),
        to: toDateParam(currentRequest.toDate),
        status: currentRequest.status || undefined,
        page: currentRequest.page,
        size: 10,
      });

      setSessions(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions(true).finally(() => {
      hasLoaded.current = true;
    });
  }, [fetchSessions]);

  useEffect(() => {
    if (!hasLoaded.current) return;

    const timeout = setTimeout(() => {
      fetchSessions(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchSessions, fromDate, page, query, status, toDate]);

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
    return <div className="card bg-base-100 p-6">Loading sessions...</div>;
  }

  return (
    <div className="card bg-base-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Session Management</h2>
        {refreshing && (
          <span className="text-sm opacity-70">Refreshing...</span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Search</span>
          <input
            type="text"
            placeholder="Search by session ID or title..."
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
              setStatus(e.target.value as SessionStatusFilter);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            {SESSION_STATUS_OPTIONS.map((sessionStatus) => (
              <option key={sessionStatus} value={sessionStatus}>
                {sessionStatus}
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
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Booked</th>
              <th>Manager</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center opacity-70">
                  No sessions found.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${getStatusDotClass(
                        session.status,
                      )}`}
                      title={session.status}
                    />
                  </td>
                  <td>{session.id}</td>
                  <td>{session.tourTitle}</td>
                  <td>{formatDate(session.date)}</td>
                  <td>{formatTime(session.time)}</td>
                  <td>
                    {session.bookedParticipants}/{session.maxParticipants}
                  </td>
                  <td>{session.managerName || "-"}</td>
                  <td className="text-right">
                    <button
                      className="btn btn-sm"
                      onClick={() => setSelectedSession(session)}
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

      {selectedSession && (
        <AdminSessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
