"use client";

import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "@/components/common/CustomDateInput";
import { Tour } from "@/types";
import { TourSessionDto } from "@/types/tourSession";
import SessionCard from "./SessionCard";
import SessionDetailsModal from "./SessionDetailsModal";
import { useSessionManager } from "@/hooks/useSessionManager";

const ACTIVE_STATUSES: TourSessionDto["status"][] = ["PLANNED", "CONFIRMED"];

const PAST_STATUSES: TourSessionDto["status"][] = [
  "COMPLETED",
  "CANCELLED",
  "CANCELLED_CONFIRMED",
];

const ALL_STATUSES: TourSessionDto["status"][] = [
  "PLANNED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "CANCELLED_CONFIRMED",
];

interface Props {
  sessions: TourSessionDto[];
  tours: Tour[];
  shopId: number;
}

export default function ManagerSessionSection({ tours, shopId }: Props) {
  const [activeTab, setActiveTab] = useState<"today" | "active" | "past">(
    "today",
  );

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<"DATE" | "STATUS">("DATE");
  const [statusFilter, setStatusFilter] = useState<TourSessionDto["status"][]>(
    [],
  );
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const hasDateFilter = Boolean(fromDate || toDate);

  const isActiveOrder = (status: string) =>
    status !== "CANCELLED" && status !== "CANCELLED_CONFIRMED";

  const {
    sessionList,
    selectedSessionId,
    setSelectedSessionId,
    confirmSession,
    completeSession,
    updateLocalSession,
  } = useSessionManager(shopId);

  type OrderSort = "DATE" | "STATUS";

  //Default “From” date = today (first navigation)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setFromDate(today);
  }, []);
  useEffect(() => {
    if (!statusFilterOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = statusFilterRef.current;
      if (!el) return;

      // if click is outside dropdown wrapper → close
      if (!el.contains(e.target as Node)) {
        setStatusFilterOpen(false);
      }
    };

    // pointerdown catches it early and avoids “open then instantly close”
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [statusFilterOpen]);

  // ============================
  //  Filter sessions
  // ============================
  let filtered = [...sessionList];

  filtered = filtered.filter((session) => {
    const activeParticipants =
      session.participants?.filter((p) => isActiveOrder(p.status)) ?? [];

    return activeParticipants.length > 0;
  });

  // 🔹 Tab logic
  if (activeTab === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((s) => {
      const dt = new Date(`${s.date}T${s.time}`);
      return dt >= start && dt <= end;
    });
  }

  if (activeTab === "active") {
    filtered = filtered.filter((s) => ACTIVE_STATUSES.includes(s.status));
  }

  if (activeTab === "past") {
    filtered = filtered.filter((s) => PAST_STATUSES.includes(s.status));
  }
  // Date range filter
  if (fromDate) {
    filtered = filtered.filter(
      (s) => new Date(`${s.date}T${s.time}`) >= fromDate,
    );
  }

  if (statusFilter.length > 0) {
    filtered = filtered.filter((s) => statusFilter.includes(s.status));
  }

  if (fromDate) {
    filtered = filtered.filter(
      (s) => new Date(`${s.date}T${s.time}`) >= fromDate,
    );
  }

  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((s) => new Date(`${s.date}T${s.time}`) <= end);
  }

  if (sortBy === "DATE") {
    filtered.sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() -
        new Date(`${b.date}T${b.time}`).getTime(),
    );
  }

  if (sortBy === "STATUS") {
    filtered.sort((a, b) => a.status.localeCompare(b.status));
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Sessions</h2>
        <p className="text-sm text-muted-foreground">
          Manage and monitor all tour sessions.
        </p>
      </div>

      {/* ================= TAB TOGGLE ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "today"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Today
          </button>

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
              onChange={(e) => setSortBy(e.target.value as OrderSort)}
            >
              <option value="DATE">Sort by date</option>
              <option value="STATUS">Sort by status</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative flex flex-col gap-1" ref={statusFilterRef}>
            <label className="text-xs text-muted-foreground">Status</label>

            <button
              className="btn btn-sm btn-outline w-full h-10 justify-between hover:border-primary hover:text-primary transition-colors"
              onClick={() => setStatusFilterOpen((v) => !v)}
            >
              {statusFilter.length === 0
                ? "All statuses"
                : `${statusFilter.length} selected`}
            </button>

            {statusFilterOpen && (
              <div className="absolute left-0 top-full mt-2 w-full bg-base-100 border border-base-300 rounded-xl shadow-md z-30 p-2">
                {ALL_STATUSES.map((st) => {
                  const checked = statusFilter.includes(st);
                  return (
                    <label
                      key={st}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-base-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={checked}
                        onChange={() =>
                          setStatusFilter((prev) =>
                            checked
                              ? prev.filter((s) => s !== st)
                              : [...prev, st],
                          )
                        }
                      />
                      <span className="text-sm">{st}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              type="button"
              className="btn btn-sm btn-outline w-full h-10 hover:border-primary hover:text-primary transition-colors"
              disabled={!hasDateFilter && statusFilter.length === 0}
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
            <p className="text-muted-foreground">No sessions to display.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filtered.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                tour={tours.find((t) => t.id === session.tourId)}
                onClick={() => setSelectedSessionId(session.id!)}
                onConfirmSession={confirmSession}
                onCompleteSession={completeSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
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
