"use client";

import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

import CustomDateInput from "@/components/common/CustomDateInput";
import { TourSessionService } from "@/lib/tours/tourSessionService";
import { Tour } from "@/types";
import { TourSessionDto } from "@/types/tourSession";

import SessionCard from "../../manager/session/SessionCard";
import SessionDetailsModal from "../../manager/session/SessionDetailsModal";

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

const formatStatus = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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
  const currentCount = sessionList.filter((session) =>
    CURRENT_STATUSES.includes(session.status),
  ).length;
  const pastCount = sessionList.filter((session) =>
    PAST_STATUSES.includes(session.status),
  ).length;

  useEffect(() => {
    setSessionList(sessions);
  }, [sessions]);

  useEffect(() => {
    if (!statusFilterOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const container = statusFilterRef.current;

      if (!container?.contains(event.target as Node)) {
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
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, status: "CONFIRMED" }
          : session,
      ),
    );
  };

  const handleCompleteSession = async (sessionId: number) => {
    await TourSessionService.updateStatus(sessionId, "COMPLETED");
    toast.success("Session marked as completed");

    setSessionList((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, status: "COMPLETED" }
          : session,
      ),
    );
  };

  const handleSessionUpdated = (updated: TourSessionDto) => {
    setSessionList((prev) =>
      prev.map((session) => (session.id === updated.id ? updated : session)),
    );
  };

  let filtered = [...sessionList];

  filtered = filtered.filter((session) =>
    activeTab === "current"
      ? CURRENT_STATUSES.includes(session.status)
      : PAST_STATUSES.includes(session.status),
  );

  if (statusFilter.length > 0) {
    filtered = filtered.filter((session) =>
      statusFilter.includes(session.status),
    );
  }

  if (fromDate) {
    filtered = filtered.filter(
      (session) => new Date(`${session.date}T${session.time}`) >= fromDate,
    );
  }

  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(
      (session) => new Date(`${session.date}T${session.time}`) <= end,
    );
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
    <section className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Sessions
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-base-content">
            Assigned Sessions
          </h2>
          <p className="mt-2 text-sm leading-6 text-base-content/60">
            Filter upcoming and past sessions, then open any session for full
            operational details.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1">
          <button
            onClick={() => setActiveTab("current")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "current"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/65 hover:text-primary"
            }`}
          >
            Current ({currentCount})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "past"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/65 hover:text-primary"
            }`}
          >
            Past ({pastCount})
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/25 p-4">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
              From
            </span>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              customInput={
                <CustomDateInput
                  value={fromDate ? fromDate.toLocaleDateString("en-GB") : ""}
                  onClear={() => setFromDate(null)}
                />
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
              To
            </span>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              customInput={
                <CustomDateInput
                  value={toDate ? toDate.toLocaleDateString("en-GB") : ""}
                  onClear={() => setToDate(null)}
                />
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
              Sort
            </label>
            <select
              className="select select-bordered h-11 w-full bg-base-100"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as "DATE" | "STATUS")
              }
            >
              <option value="DATE">Sort by date</option>
              <option value="STATUS">Sort by status</option>
            </select>
          </div>

          <div className="relative flex flex-col gap-1" ref={statusFilterRef}>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
              Status
            </label>

            <button
              className="btn btn-outline h-11 w-full justify-between"
              onClick={() => setStatusFilterOpen((open) => !open)}
            >
              {statusFilter.length === 0
                ? "All statuses"
                : `${statusFilter.length} selected`}
            </button>

            {statusFilterOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-base-300 bg-base-100 p-2 shadow-md">
                {ALL_STATUSES.map((status) => {
                  const checked = statusFilter.includes(status);

                  return (
                    <label
                      key={status}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-base-200"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={checked}
                        onChange={() =>
                          setStatusFilter((prev) =>
                            checked
                              ? prev.filter((item) => item !== status)
                              : [...prev, status],
                          )
                        }
                      />
                      <span className="text-sm">{formatStatus(status)}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-end">
            <button
              className="btn btn-outline h-11 w-full"
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

      <div className="mt-5">
        <p className="text-sm text-base-content/60">
          Showing {filtered.length} session{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/25 p-8 text-center">
            <p className="text-base-content/60">No sessions to display.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                tour={tours.find((tour) => tour.id === session.tourId)}
                onClick={() => setSelectedSessionId(session.id)}
                onConfirmSession={handleConfirmSession}
                onCompleteSession={handleCompleteSession}
              />
            ))}
          </div>
        )}
      </div>

      {selectedSessionId && (
        <SessionDetailsModal
          session={sessionList.find((session) => session.id === selectedSessionId)!}
          onClose={() => setSelectedSessionId(null)}
          onConfirmSession={handleConfirmSession}
          onCompleteSession={handleCompleteSession}
          onSessionUpdated={handleSessionUpdated}
        />
      )}
    </section>
  );
}

