"use client";

import { useMemo, useState } from "react";
import { TourSessionDto } from "@/types/tourSession";
import DatePicker from "react-datepicker";
import CustomDateInput from "@/components/common/CustomDateInput";
import SessionDetailsModal from "../session/SessionDetailsModal";
import { useSessionManager } from "@/hooks/useSessionManager";

type AssignmentStatusFilter = "ALL" | "COMPLETED" | "CONFIRMED" | "PLANNED";

const isActiveOrder = (status: string) =>
  status !== "CANCELLED" && status !== "CANCELLED_CONFIRMED";

interface Props {
  shopId: number;
}

export default function ManagerAssignmentSection({ shopId }: Props) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<AssignmentStatusFilter>("ALL");

  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(
    new Set(),
  );

  const {
    sessionList,
    selectedSessionId,
    setSelectedSessionId,
    confirmSession,
    completeSession,
    updateLocalSession,
  } = useSessionManager(shopId);

  const toggleManager = (key: string) => {
    setExpandedManagers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // =============================
  // Filtering
  // =============================
  const filteredSessions = useMemo(() => {
    let result = [...sessionList];

    if (fromDate) {
      result = result.filter(
        (s) => new Date(`${s.date}T${s.time}`) >= fromDate,
      );
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((s) => new Date(`${s.date}T${s.time}`) <= end);
    }

    if (statusFilter !== "ALL") {
      result = result.filter((s) => s.status === statusFilter);
    }

    return result;
  }, [sessionList, fromDate, toDate, statusFilter]);

  // =============================
  // Group by manager (always show unassigned)
  // =============================
  const sessionsByManager = useMemo(() => {
    const map = new Map<string, TourSessionDto[]>();

    filteredSessions.forEach((session) => {
      const key = session.managerId ?? "unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(session);
    });

    return [...map.entries()];
  }, [filteredSessions]);

  const overviewFinance = useMemo(
    () => calculateOverviewFinance(filteredSessions),
    [filteredSessions],
  );

  // =============================
  // Current month revenue calculator
  // =============================
  function calculateSessionFinance(session: TourSessionDto) {
    const gross =
      session.participants
        ?.filter((item) => isActiveOrder(item.status))
        .reduce((sum, item) => sum + (item.pricePaid ?? 0), 0) ?? 0;

    const fee = gross * 0.1;
    const payout = gross - fee;

    const isProjected =
      session.status === "PLANNED" || session.status === "CONFIRMED";

    return {
      gross,
      fee,
      payout,
      label: isProjected ? "Projected income" : "Session income",
    };
  }

  function calculateManagerFinance(sessions: TourSessionDto[]) {
    const gross = sessions.reduce((sum, session) => {
      const sessionGross =
        session.participants
          ?.filter((item) => isActiveOrder(item.status))
          .reduce((s, item) => s + (item.pricePaid ?? 0), 0) ?? 0;

      return sum + sessionGross;
    }, 0);

    const fee = gross * 0.1;
    const payout = gross - fee;

    return { gross, fee, payout };
  }

  function calculateOverviewFinance(sessions: TourSessionDto[]) {
    let projectedGross = 0;
    let completedGross = 0;

    sessions.forEach((session) => {
      const gross =
        session.participants
          ?.filter((item) => isActiveOrder(item.status))
          .reduce((sum, item) => sum + (item.pricePaid ?? 0), 0) ?? 0;

      if (session.status === "COMPLETED") {
        completedGross += gross;
      } else if (
        session.status === "PLANNED" ||
        session.status === "CONFIRMED"
      ) {
        projectedGross += gross;
      }
    });

    const totalGross = projectedGross + completedGross;
    const totalFee = totalGross * 0.1;
    const totalPayout = totalGross - totalFee;

    return {
      projectedGross,
      completedGross,
      totalGross,
      totalFee,
      totalPayout,
    };
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold">Guide Performance</h2>
        <p className="text-sm text-muted-foreground">
          Overview of sessions assigned to each guide.
        </p>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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

          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <select
              className="select select-sm select-bordered"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as AssignmentStatusFilter)
              }
            >
              <option value="ALL">All</option>
              <option value="COMPLETED">Completed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PLANNED">Planned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Gross */}
          <div>
            <div className="text-xs text-muted-foreground">Total Income</div>
            <div className="text-2xl font-bold">
              €{overviewFinance.totalGross.toFixed(2)}
            </div>
          </div>

          {/* Platform Fee */}
          <div>
            <div className="text-xs text-muted-foreground">
              Platform Fees (10%)
            </div>
            <div className="text-2xl font-bold text-red-500">
              €{overviewFinance.totalFee.toFixed(2)}
            </div>
          </div>

          {/* Payout */}
          <div>
            <div className="text-xs text-muted-foreground">Total Payout</div>
            <div className="text-2xl font-bold text-green-600">
              €{overviewFinance.totalPayout.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-4">
          <div>
            <div className="text-xs text-muted-foreground">
              Projected Income
            </div>
            <div className="text-lg font-semibold text-primary">
              €{overviewFinance.projectedGross.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Completed Income
            </div>
            <div className="text-lg font-semibold">
              €{overviewFinance.completedGross.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* ================= GROUPED BY MANAGER ================= */}
      <div className="space-y-4">
        {sessionsByManager.map(([managerKey, sessions]) => {
          const first = sessions[0];

          const managerName =
            managerKey === "unassigned" ? "Unassigned" : first.managerName;

          const managerEmail =
            managerKey === "unassigned" ? "—" : first.managerEmail;

          const managerRole =
            managerKey === "unassigned" ? "—" : first.managerRole;

          const { gross, fee, payout } = calculateManagerFinance(sessions);

          const isOpen = expandedManagers.has(managerKey);

          return (
            <div
              key={managerKey}
              className="rounded-xl border border-base-300 bg-base-100 shadow-sm"
            >
              {/* Header (Clickable) */}
              <button
                onClick={() => toggleManager(managerKey)}
                className="w-full p-4 flex items-center justify-between hover:bg-base-200 transition"
              >
                <div className="text-left">
                  <div className="text-lg font-semibold">{managerName}</div>

                  <div className="text-sm text-muted-foreground">
                    {managerEmail} {managerRole && `• ${managerRole}`}
                  </div>

                  <div className="text-sm text-muted-foreground mt-1">
                    Sessions: {sessions.length}
                  </div>
                </div>

                <div className="text-right min-w-[180px]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8 text-sm">
                    {/* Gross */}
                    <div className="flex justify-between sm:flex-col sm:items-end">
                      <span className="text-muted-foreground text-xs">
                        Current month revenue
                      </span>
                      <span className="font-semibold">€{gross.toFixed(2)}</span>
                    </div>

                    {/* Platform Fee */}
                    <div className="flex justify-between sm:flex-col sm:items-end">
                      <span className="text-muted-foreground text-xs">
                        Platform fee
                      </span>
                      <span className="font-semibold text-red-500">
                        €{fee.toFixed(2)}
                      </span>
                    </div>

                    {/* Payout */}
                    <div className="flex justify-between sm:flex-col sm:items-end">
                      <span className="text-muted-foreground text-xs">
                        Payout
                      </span>
                      <span className="font-semibold text-green-600">
                        €{payout.toFixed(2)}
                      </span>
                    </div>

                    {/* Expand indicator */}
                    <div className="text-primary text-sm sm:ml-4">
                      {isOpen ? "▲" : "▼"}
                    </div>
                  </div>
                </div>
              </button>

              {/* Collapsible Sessions */}
              {isOpen && (
                <div className="border-t border-base-300">
                  {sessions.map((s) => {
                    const { gross, fee, payout, label } =
                      calculateSessionFinance(s);

                    return (
                      <button
                        key={s.id}
                        className="w-full text-left border border-base-200 p-4 
             hover:border-primary/60 hover:shadow-sm transition"
                        onClick={() => setSelectedSessionId(s.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* LEFT SIDE */}
                          <div>
                            <div className="font-semibold text-base">
                              {s.tourTitle}
                            </div>

                            <div className="text-xs text-gray-400 mt-1">
                              Session ID: #{s.id}
                            </div>

                            <div className="text-sm text-muted-foreground mt-1">
                              {s.date} • {s.time}
                            </div>

                            <div className="text-sm text-muted-foreground">
                              Status: {s.status}
                            </div>
                          </div>

                          {/* RIGHT SIDE — Finance */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8 text-sm">
                            {/* Gross */}
                            <div className="flex justify-between sm:flex-col sm:items-end">
                              <span className="text-muted-foreground text-xs">
                                {label}
                              </span>
                              <span className="font-semibold">
                                €{gross.toFixed(2)}
                              </span>
                            </div>

                            {/* Platform Fee */}
                            <div className="flex justify-between sm:flex-col sm:items-end">
                              <span className="text-muted-foreground text-xs">
                                Platform fee
                              </span>
                              <span className="font-semibold text-red-500">
                                €{fee.toFixed(2)}
                              </span>
                            </div>

                            {/* Payout */}
                            <div className="flex justify-between sm:flex-col sm:items-end">
                              <span className="text-muted-foreground text-xs">
                                Payout
                              </span>
                              <span className="font-semibold text-green-600">
                                €{payout.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
