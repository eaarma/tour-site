"use client";

import { useEffect, useRef, useState } from "react";
import CardFrame from "@/components/common/CardFrame";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "@/components/common/CustomDateInput";
import { Tour } from "@/types";
import { TourSessionDto } from "@/types/tourSession";
import SessionCard from "./SessionCard";
import SessionDetailsModal from "./SessionDetailsModal";
import { TourSessionService } from "@/lib/tourSessionService";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

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
  shopId: number; // 🔥 REQUIRED so reloadSessions works
}

export default function ManagerOrderSection({
  sessions,
  tours,
  shopId,
}: Props) {
  const [activeTab, setActiveTab] = useState<"today" | "active" | "past">(
    "today"
  );
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<"DATE" | "STATUS">("DATE");
  const [statusFilter, setStatusFilter] = useState<TourSessionDto["status"][]>(
    []
  );
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const hasDateFilter = Boolean(fromDate || toDate);

  const { user } = useAuth();

  const [sessionList, setSessionList] = useState<TourSessionDto[]>(sessions);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );

  //Default “From” date = today (first navigation)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setFromDate(today);
  }, []);

  // ⬇️ sync when parent updates
  useEffect(() => {
    setSessionList(sessions);
  }, [sessions]);

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

  // ⬇️ reload sessions from backend
  const reloadSessions = async () => {
    if (!shopId) return;
    const updated = await TourSessionService.getByShopId(shopId);
    // ⭐ Filter: only sessions with participants
    const updatedFiltered = updated.filter(
      (s) => (s.participants?.length ?? 0) > 0
    );

    setSessionList(updatedFiltered);
  };

  // ⬇️ confirm session: assign manager + change status
  const handleConfirmSession = async (sessionId: number) => {
    if (!user?.id) return;

    await TourSessionService.assignManager(sessionId, user.id);
    await TourSessionService.updateStatus(sessionId, "CONFIRMED");
    toast.success("Session confirmed");
    await reloadSessions();
  };

  // ⬇️ complete session
  const handleCompleteSession = async (sessionId: number) => {
    await TourSessionService.updateStatus(sessionId, "COMPLETED");
    toast.success("Session marked as completed");
    await reloadSessions();
  };

  const handleSessionUpdated = (updated: TourSessionDto) => {
    setSessionList((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  // ============================
  //  Filter sessions
  // ============================
  let filtered = [...sessionList];
  const now = new Date();

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
      (s) => new Date(`${s.date}T${s.time}`) >= fromDate
    );
  }

  if (statusFilter.length > 0) {
    filtered = filtered.filter((s) => statusFilter.includes(s.status));
  }

  if (fromDate) {
    filtered = filtered.filter(
      (s) => new Date(`${s.date}T${s.time}`) >= fromDate
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
        new Date(`${b.date}T${b.time}`).getTime()
    );
  }

  if (sortBy === "STATUS") {
    filtered.sort((a, b) => a.status.localeCompare(b.status));
  }

  return (
    <section className="mb-12">
      <CardFrame>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Manage Sessions</h2>

          {/* Tabs */}
          <div className="sticky top-0 z-10 bg-base-200 pb-3">
            <div className="tabs tabs-boxed mb-3">
              <button
                className={`tab ${activeTab === "today" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("today")}
              >
                Today
              </button>
              <button
                className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("active")}
              >
                Active
              </button>
              <button
                className={`tab ${activeTab === "past" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("past")}
              >
                Past
              </button>
            </div>

            {/* Date pickers */}
            <div className="flex gap-4 items-center mb-2 mt-2">
              <div className="flex items-center gap-2">
                <label className="text-sm">From:</label>
                <DatePicker
                  selected={fromDate}
                  onChange={(d) => setFromDate(d)}
                  dateFormat="yyyy-MM-dd"
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
                  customInput={
                    <CustomDateInput
                      value={toDate ? toDate.toLocaleDateString("en-GB") : ""}
                      onClear={() => setToDate(null)}
                    />
                  }
                />
              </div>
              {/* CLEAR DATES (STATIC, DISABLED WHEN EMPTY) */}
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
          </div>

          {/* SORT + FILTER CONTROLS */}
          <div className="flex flex-wrap gap-4 items-center mt-4 mb-4">
            {/* SORT */}
            <select
              className="select select-bordered select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="DATE">Sort by date</option>
              <option value="STATUS">Sort by status</option>
            </select>

            {/* STATUS FILTER DROPDOWN */}
            <div className="relative" ref={statusFilterRef}>
              <button
                className="btn btn-sm btn-outline min-w-[180px] justify-between"
                onClick={() => setStatusFilterOpen((v) => !v)}
              >
                {statusFilter.length === 0
                  ? "All statuses"
                  : `${statusFilter.length} status${
                      statusFilter.length > 1 ? "es" : ""
                    }`}
              </button>

              {statusFilterOpen && (
                <div
                  className="absolute left-0 mt-2 w-52 bg-base-100 border shadow-md rounded-lg z-30 p-2"
                  onClick={(e) => e.stopPropagation()}
                >
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
                                : [...prev, st]
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
          <div className="space-y-3 min-h-[465px] max-h-[465px] overflow-y-auto pr-2">
            {filtered.length > 0 ? (
              filtered.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  tour={tours.find((t) => t.id === session.tourId)}
                  onClick={() => setSelectedSessionId(session.id!)}
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
                  sessionList.find((s) => s.id === selectedSessionId)!.tourId
              )}
              onClose={() => setSelectedSessionId(null)}
              onConfirmSession={handleConfirmSession}
              onCompleteSession={handleCompleteSession}
              onSessionUpdated={handleSessionUpdated}
            />
          )}
        </div>
      </CardFrame>
    </section>
  );
}
