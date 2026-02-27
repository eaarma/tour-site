"use client";

import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "@/components/common/CustomDateInput";
import { Tour } from "@/types";
import { TourSessionDto } from "@/types/tourSession";
import SessionCard from "../manager/session/SessionCard";
import SessionDetailsModal from "../manager/session/SessionDetailsModal";
import toast from "react-hot-toast";
import { TourSessionService } from "@/lib/tourSessionService";

const CURRENT_STATUSES: TourSessionDto["status"][] = ["PLANNED", "CONFIRMED"];
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
}

export default function ManagerProfileSessionSection({
  sessions,
  tours,
}: Props) {
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<"DATE" | "STATUS">("DATE");
  const [statusFilter, setStatusFilter] = useState<TourSessionDto["status"][]>(
    [],
  );
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);

  const [sessionList, setSessionList] = useState<TourSessionDto[]>(sessions);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );

  const hasDateFilter = Boolean(fromDate || toDate);

  /*  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setFromDate(today);
  }, []); */

  useEffect(() => {
    setSessionList(sessions);
  }, [sessions]);

  useEffect(() => {
    if (!statusFilterOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = statusFilterRef.current;
      if (!el?.contains(e.target as Node)) {
        setStatusFilterOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [statusFilterOpen]);

  const handleConfirmSession = async (sessionId: number) => {
    await TourSessionService.updateStatus(sessionId, "CONFIRMED");
    toast.success("Session confirmed");

    setSessionList((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "CONFIRMED" } : s)),
    );
  };

  const handleCompleteSession = async (sessionId: number) => {
    await TourSessionService.updateStatus(sessionId, "COMPLETED");
    toast.success("Session marked as completed");

    setSessionList((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "COMPLETED" } : s)),
    );
  };

  const handleSessionUpdated = (updated: TourSessionDto) => {
    setSessionList((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
  };

  // ============================
  // Filtering
  // ============================

  let filtered = [...sessionList];

  filtered = filtered.filter((s) =>
    activeTab === "current"
      ? CURRENT_STATUSES.includes(s.status)
      : PAST_STATUSES.includes(s.status),
  );

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
  } else {
    filtered.sort((a, b) => a.status.localeCompare(b.status));
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Your Sessions</h2>
        <p className="text-sm text-muted-foreground">
          Monitor and manage your assigned sessions.
        </p>
      </div>

      {/* TAB TOGGLE */}
      <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1">
        <button
          onClick={() => setActiveTab("current")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "current"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          Current
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

      {/* FILTERS */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* From */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">From</span>
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
            <span className="text-xs text-muted-foreground">To</span>
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

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Sort</label>
            <select
              className="select select-sm select-bordered"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "DATE" | "STATUS")}
            >
              <option value="DATE">Sort by date</option>
              <option value="STATUS">Sort by status</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="relative flex flex-col gap-1" ref={statusFilterRef}>
            <label className="text-xs text-muted-foreground">Status</label>

            <button
              className="btn btn-sm btn-outline justify-between"
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

          {/* Clear */}
          <div className="flex items-end">
            <button
              className="btn btn-sm btn-outline w-full"
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

      {/* LIST */}
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
                onClick={() => setSelectedSessionId(session.id)}
                onConfirmSession={handleConfirmSession}
                onCompleteSession={handleCompleteSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedSessionId && (
        <SessionDetailsModal
          session={sessionList.find((s) => s.id === selectedSessionId)!}
          onClose={() => setSelectedSessionId(null)}
          onConfirmSession={handleConfirmSession}
          onCompleteSession={handleCompleteSession}
          onSessionUpdated={handleSessionUpdated}
        />
      )}
    </div>
  );
}
