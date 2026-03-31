"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import ManagerPayoutSessionModal from "./ManagerPayoutSessionModal";
import ManagerPayoutSessionRow from "./ManagerPayoutSessionRow";
import { PayoutService } from "@/lib/payoutService";
import {
  PayoutSessionDetailsDto,
  PayoutSessionSummaryDto,
  PayoutStatus,
} from "@/types/payout";

type Props = {
  shopId: number;
};

const PAYOUT_STATUS_OPTIONS = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const satisfies readonly PayoutStatus[];

type PayoutStatusFilter = "" | PayoutStatus;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  CURRENT_YEAR + 1,
  CURRENT_YEAR,
  CURRENT_YEAR - 1,
  CURRENT_YEAR - 2,
];

const MONTH_OPTIONS = [
  { value: "", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;

const formatCurrency = (value: number, currency = "EUR") =>
  `${value.toFixed(2)} ${currency}`;

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;

  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const getMonthGroupDate = (session: PayoutSessionSummaryDto) =>
  parseLocalDate(session.periodStart) ?? parseLocalDate(session.periodEnd);

const getMonthGroupKey = (session: PayoutSessionSummaryDto) => {
  const date = getMonthGroupDate(session);
  if (!date) {
    return `unknown-${session.sessionId ?? session.sessionTitle}`;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthGroupLabel = (date: Date | null) => {
  if (!date) return "Unknown month";

  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

const groupSessionsByMonth = (sessions: PayoutSessionSummaryDto[]) => {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      totalAmount: number;
      transactionCount: number;
      sessions: PayoutSessionSummaryDto[];
    }
  >();

  for (const session of sessions) {
    const key = getMonthGroupKey(session);
    const existing = groups.get(key);

    if (existing) {
      existing.totalAmount += session.totalAmount;
      existing.transactionCount += session.transactionCount;
      existing.sessions.push(session);
      continue;
    }

    groups.set(key, {
      key,
      label: getMonthGroupLabel(getMonthGroupDate(session)),
      totalAmount: session.totalAmount,
      transactionCount: session.transactionCount,
      sessions: [session],
    });
  }

  return Array.from(groups.values());
};

export default function ManagerPayoutSection({ shopId }: Props) {
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PayoutStatusFilter>("");
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<PayoutSessionSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<PayoutSessionSummaryDto | null>(null);
  const [selectedSessionDetails, setSelectedSessionDetails] =
    useState<PayoutSessionDetailsDto | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [expandedMonthGroups, setExpandedMonthGroups] = useState<
    Record<string, boolean>
  >({});

  const hasLoaded = useRef(false);

  const fetchSessionSummaries = useCallback(
    async (initial = false) => {
      try {
        if (initial) setLoading(true);
        else setRefreshing(true);

        const data = await PayoutService.getManagerSessionSummaries(shopId, {
          query: search || undefined,
          status: selectedStatus || undefined,
          year: selectedYear,
          month: selectedMonth ? Number(selectedMonth) : undefined,
        });

        setSessions(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load payout sessions");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, selectedStatus, selectedYear, selectedMonth, shopId],
  );

  useEffect(() => {
    const initial = !hasLoaded.current;
    const timeout = setTimeout(
      () => {
        fetchSessionSummaries(initial).finally(() => {
          hasLoaded.current = true;
        });
      },
      initial ? 0 : 300,
    );

    return () => clearTimeout(timeout);
  }, [fetchSessionSummaries]);

  useEffect(() => {
    setExpandedMonthGroups({});
    setSelectedSession(null);
    setSelectedSessionDetails(null);
    setDetailsLoading(false);
  }, [search, selectedMonth, selectedStatus, selectedYear]);

  const showMonthGroups = !selectedMonth;
  const monthGroups = useMemo(
    () => (showMonthGroups ? groupSessionsByMonth(sessions) : []),
    [sessions, showMonthGroups],
  );

  useEffect(() => {
    if (!showMonthGroups || monthGroups.length === 0) return;

    setExpandedMonthGroups((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }

      return { [monthGroups[0].key]: true };
    });
  }, [monthGroups, showMonthGroups]);

  const handleViewSession = async (session: PayoutSessionSummaryDto) => {
    if (session.sessionId == null) {
      toast.error("No session details are available for this entry.");
      return;
    }

    try {
      setSelectedSession(session);
      setSelectedSessionDetails(null);
      setDetailsLoading(true);

      const data = await PayoutService.getManagerSessionDetails(shopId, {
        sessionId: session.sessionId,
        status: selectedStatus || undefined,
        from: session.periodStart || undefined,
        to: session.periodEnd || undefined,
      });

      setSelectedSessionDetails(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payout session details");
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) {
    return <div className="card bg-base-100 p-6">Loading payout overview...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Payouts</h2>
          <p className="text-sm text-muted-foreground">
            Review payout-ready and already paid transaction totals for this
            shop, grouped by session within each month.
          </p>
        </div>

        {refreshing && (
          <span className="text-sm opacity-70">Refreshing...</span>
        )}
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Year</span>
            <select
              className="select select-bordered w-full"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Month</span>
            <select
              className="select select-bordered w-full"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.label} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <select
              className="select select-bordered w-full"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as PayoutStatusFilter)
              }
            >
              <option value="">All statuses</option>
              {PAYOUT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Search</span>
            <input
              type="text"
              placeholder="Search by session title or ID..."
              className="input input-bordered w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-base-300 p-4 text-sm opacity-70">
          No payout sessions found for the selected filters.
        </div>
      ) : showMonthGroups ? (
        <div className="space-y-3">
          {monthGroups.map((group) => {
            const isExpanded = !!expandedMonthGroups[group.key];

            return (
              <div
                key={group.key}
                className="rounded-xl border border-base-300 bg-base-100"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                  onClick={() =>
                    setExpandedMonthGroups((prev) => ({
                      ...prev,
                      [group.key]: !prev[group.key],
                    }))
                  }
                  aria-expanded={isExpanded}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 rounded-full bg-base-200 p-1 text-base-content/70">
                      <ChevronRight
                        className={`size-4 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </span>

                    <div className="min-w-0">
                      <p className="font-semibold text-base">{group.label}</p>
                      <p className="text-sm opacity-70">
                        {group.sessions.length}{" "}
                        {group.sessions.length === 1 ? "session" : "sessions"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-base font-semibold text-green-600">
                      {formatCurrency(group.totalAmount)}
                    </p>
                    <p className="text-xs opacity-70">
                      {group.transactionCount}{" "}
                      {group.transactionCount === 1
                        ? "transaction"
                        : "transactions"}
                    </p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-base-200 px-4">
                    {group.sessions.map((session) => (
                      <ManagerPayoutSessionRow
                        key={`${group.key}-${session.sessionId ?? session.sessionTitle}`}
                        sessionId={session.sessionId}
                        sessionTitle={session.sessionTitle}
                        scheduledAt={session.scheduledAt}
                        transactionCount={session.transactionCount}
                        totalAmount={session.totalAmount}
                        currency={session.currency}
                        status={session.status}
                        payoutId={session.payoutId}
                        paidAt={session.paidAt}
                        onView={() => handleViewSession(session)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-base-300 bg-base-100 px-4 divide-y divide-base-200">
          {sessions.map((session) => (
            <ManagerPayoutSessionRow
              key={`${session.sessionId ?? "none"}-${session.sessionTitle}`}
              sessionId={session.sessionId}
              sessionTitle={session.sessionTitle}
              scheduledAt={session.scheduledAt}
              transactionCount={session.transactionCount}
              totalAmount={session.totalAmount}
              currency={session.currency}
              status={session.status}
              payoutId={session.payoutId}
              paidAt={session.paidAt}
              onView={() => handleViewSession(session)}
            />
          ))}
        </div>
      )}

      {selectedSession && (
        <ManagerPayoutSessionModal
          session={selectedSession}
          details={selectedSessionDetails}
          loading={detailsLoading}
          onClose={() => {
            setSelectedSession(null);
            setSelectedSessionDetails(null);
          }}
        />
      )}
    </div>
  );
}
