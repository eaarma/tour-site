"use client";

import { useEffect, useRef, useState } from "react";
import CardFrame from "@/components/common/CardFrame";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "@/components/common/CustomDateInput";
import { Tour } from "@/types";
import { TourSessionDto } from "@/types/tourSession";
import SessionCard from "../manager/order/SessionCard";
import SessionDetailsModal from "../manager/order/SessionDetailsModal";
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

export default function ManagerProfileOrderSection({ sessions, tours }: Props) {
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

  type OrderSort = "DATE" | "STATUS";

  // default From = today
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setFromDate(today);
  }, []);

  useEffect(() => {
    setSessionList(sessions);
  }, [sessions]);

  // close status dropdown on outside click
  useEffect(() => {
    if (!statusFilterOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = statusFilterRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setStatusFilterOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [statusFilterOpen]);

  const hasDateFilter = Boolean(fromDate || toDate);

  const handleConfirmSession = async (sessionId: number) => {
    await TourSessionService.updateStatus(sessionId, "CONFIRMED");
    toast.success("Session confirmed");

    // update local immediately (no reload required)
    setSessionList((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "CONFIRMED" } : s)),
    );
  };

  // If you want profile page to allow “complete” from modal/card:
  const handleCompleteSession = async (sessionId: number) => {
    await TourSessionService.updateStatus(sessionId, "COMPLETED");
    toast.success("Session marked as completed");

    // update local immediately (no reload required)
    setSessionList((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "COMPLETED" } : s)),
    );
  };

  const handleSessionUpdated = (updated: TourSessionDto) => {
    setSessionList((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
  };

  // ----------------------------
  // Filtering
  // ----------------------------
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

  // Sorting
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
    <section className="mb-2">
      <CardFrame>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Your Sessions</h2>

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

          {/* Date pickers */}
          <div className="flex gap-4 items-center mb-3">
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

            <button
              className="btn btn-sm btn-outline"
              disabled={!hasDateFilter}
              onClick={() => {
                setFromDate(null);
                setToDate(null);
              }}
            >
              Clear dates
            </button>
          </div>

          {/* Sort + Filter */}
          <div className="flex flex-wrap gap-4 items-center mt-2 mb-4">
            <select
              className="select select-bordered select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as OrderSort)}
            >
              <option value="DATE">Sort by date</option>
              <option value="STATUS">Sort by status</option>
            </select>

            <div className="relative" ref={statusFilterRef}>
              <button
                className="btn btn-sm btn-outline min-w-[180px] justify-between"
                onClick={() => setStatusFilterOpen((v) => !v)}
              >
                {statusFilter.length === 0
                  ? "All statuses"
                  : `${statusFilter.length} selected`}
              </button>

              {statusFilterOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-base-100 border shadow-md rounded-lg z-30 p-2">
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
          </div>

          {/* List */}
          <div className="space-y-3 min-h-[370px] max-h-[370px] overflow-y-auto pr-2">
            {filtered.length > 0 ? (
              filtered.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  tour={tours.find((t) => t.id === session.tourId)}
                  onClick={() => setSelectedSessionId(session.id)}
                  onConfirmSession={handleConfirmSession}
                  onCompleteSession={handleCompleteSession}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No sessions to display.</p>
            )}
          </div>

          {/* Modal */}
          {selectedSessionId && (
            <SessionDetailsModal
              session={sessionList.find((s) => s.id === selectedSessionId)!}
              tour={tours.find(
                (t) =>
                  t.id ===
                  sessionList.find((s) => s.id === selectedSessionId)!.tourId,
              )}
              onClose={() => setSelectedSessionId(null)}
              onConfirmSession={() => {}}
              onCompleteSession={handleCompleteSession}
              onSessionUpdated={handleSessionUpdated}
            />
          )}
        </div>
      </CardFrame>
    </section>
  );
}
