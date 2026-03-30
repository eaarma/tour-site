"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChevronRight } from "lucide-react";
import AdminPayoutManualModal from "./AdminPayoutManualModal";
import CustomDateInput from "../common/CustomDateInput";
import PayoutShopModal from "./PayoutShopModal";
import PayoutShopRow from "./PayoutShopRow";
import { PayoutService } from "@/lib/payoutService";
import {
  PayoutCreateRequestDto,
  PayoutShopDetailsDto,
  PayoutShopSummaryDto,
  PayoutStatus,
} from "@/types/payout";

type AdminPayoutTab = "payouts" | "lookup";

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

const toDateParam = (value: Date | null) => {
  if (!value) return undefined;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

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

const formatCurrency = (value: number, currency = "EUR") =>
  `${value.toFixed(2)} ${currency}`;

const getPeriodSummary = (
  periodStart?: string | null,
  periodEnd?: string | null,
) => {
  const start = parseLocalDate(periodStart);
  const end = parseLocalDate(periodEnd);

  if (start && end) {
    const isWholeMonth =
      start.getDate() === 1 &&
      end.getDate() ===
        new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate() &&
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth();

    if (isWholeMonth) {
      return start.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
    }

    return `${start.toLocaleDateString("en-GB")} - ${end.toLocaleDateString("en-GB")}`;
  }

  if (start) return `From ${start.toLocaleDateString("en-GB")}`;
  if (end) return `Until ${end.toLocaleDateString("en-GB")}`;

  return "All dates";
};

const getMonthGroupDate = (shop: PayoutShopSummaryDto) =>
  parseLocalDate(shop.periodStart) ?? parseLocalDate(shop.periodEnd);

const getMonthGroupLabel = (date: Date | null) => {
  if (!date) return "Unknown month";

  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

const getMonthGroupKey = (shop: PayoutShopSummaryDto) => {
  const date = getMonthGroupDate(shop);
  if (!date) {
    return `unknown-${shop.shopId}`;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const groupPayoutShopsByMonth = (shops: PayoutShopSummaryDto[]) => {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      periodStart: string | null;
      periodEnd: string | null;
      totalAmount: number;
      transactionCount: number;
      shops: PayoutShopSummaryDto[];
    }
  >();

  for (const shop of shops) {
    const key = getMonthGroupKey(shop);
    const groupDate = getMonthGroupDate(shop);
    const existing = groups.get(key);

    if (existing) {
      existing.totalAmount += shop.totalAmount;
      existing.transactionCount += shop.transactionCount;
      existing.shops.push(shop);
      continue;
    }

    groups.set(key, {
      key,
      label: getMonthGroupLabel(groupDate),
      periodStart: shop.periodStart,
      periodEnd: shop.periodEnd,
      totalAmount: shop.totalAmount,
      transactionCount: shop.transactionCount,
      shops: [shop],
    });
  }

  return Array.from(groups.values());
};

export default function AdminPayouts() {
  const [activeTab, setActiveTab] = useState<AdminPayoutTab>("payouts");
  const [payoutYear, setPayoutYear] = useState<number>(CURRENT_YEAR);
  const [payoutMonth, setPayoutMonth] = useState("");
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatusFilter>("");
  const [payoutSearch, setPayoutSearch] = useState("");

  const [lookupFromDate, setLookupFromDate] = useState<Date | null>(null);
  const [lookupToDate, setLookupToDate] = useState<Date | null>(null);
  const [lookupStatus, setLookupStatus] = useState<PayoutStatusFilter>("");
  const [lookupSearch, setLookupSearch] = useState("");

  const [shops, setShops] = useState<PayoutShopSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedShop, setSelectedShop] = useState<PayoutShopSummaryDto | null>(
    null,
  );
  const [selectedShopDetails, setSelectedShopDetails] =
    useState<PayoutShopDetailsDto | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedPayoutShop, setSelectedPayoutShop] =
    useState<PayoutShopSummaryDto | null>(null);
  const [creatingPayout, setCreatingPayout] = useState(false);
  const [expandedMonthGroups, setExpandedMonthGroups] = useState<
    Record<string, boolean>
  >({});

  const hasLoaded = useRef(false);

  const buildSummaryParams = useCallback(() => {
    if (activeTab === "payouts") {
      return {
        query: payoutSearch || undefined,
        status: payoutStatus || undefined,
        year: payoutYear,
        month: payoutMonth ? Number(payoutMonth) : undefined,
      };
    }

    return {
      query: lookupSearch || undefined,
      status: lookupStatus || undefined,
      from: toDateParam(lookupFromDate),
      to: toDateParam(lookupToDate),
    };
  }, [
    activeTab,
    lookupFromDate,
    lookupSearch,
    lookupStatus,
    lookupToDate,
    payoutMonth,
    payoutSearch,
    payoutStatus,
    payoutYear,
  ]);

  const showPayoutMonthGroups = activeTab === "payouts" && !payoutMonth;
  const payoutMonthGroups = useMemo(
    () => (showPayoutMonthGroups ? groupPayoutShopsByMonth(shops) : []),
    [shops, showPayoutMonthGroups],
  );

  const fetchShopSummaries = useCallback(
    async (initial = false) => {
      try {
        if (initial) setLoading(true);
        else setRefreshing(true);

        const data = await PayoutService.getShopSummaries(buildSummaryParams());
        setShops(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load payout shops");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buildSummaryParams],
  );

  useEffect(() => {
    const initial = !hasLoaded.current;
    const timeout = setTimeout(
      () => {
        fetchShopSummaries(initial).finally(() => {
          hasLoaded.current = true;
        });
      },
      initial ? 0 : 300,
    );

    return () => clearTimeout(timeout);
  }, [fetchShopSummaries]);

  useEffect(() => {
    setSelectedShop(null);
    setSelectedShopDetails(null);
    setDetailsLoading(false);
    setSelectedPayoutShop(null);
    setExpandedMonthGroups({});
  }, [
    activeTab,
    lookupFromDate,
    lookupSearch,
    lookupStatus,
    lookupToDate,
    payoutMonth,
    payoutSearch,
    payoutStatus,
    payoutYear,
  ]);

  useEffect(() => {
    if (!showPayoutMonthGroups || payoutMonthGroups.length === 0) return;

    setExpandedMonthGroups((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }

      return { [payoutMonthGroups[0].key]: true };
    });
  }, [payoutMonthGroups, showPayoutMonthGroups]);

  const handleViewShop = async (shop: PayoutShopSummaryDto) => {
    try {
      setSelectedShop(shop);
      setSelectedShopDetails(null);
      setDetailsLoading(true);

      const data = await PayoutService.getShopDetails(shop.shopId, {
        status:
          activeTab === "payouts"
            ? payoutStatus || undefined
            : lookupStatus || undefined,
        from: shop.periodStart || undefined,
        to: shop.periodEnd || undefined,
      });

      setSelectedShopDetails(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payout details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePayout = (shop: PayoutShopSummaryDto) => {
    setSelectedPayoutShop(shop);
  };

  const handleCreatePayout = async (payload: PayoutCreateRequestDto) => {
    const shopName = selectedPayoutShop?.shopName ?? `Shop #${payload.shopId}`;

    try {
      setCreatingPayout(true);

      const createdPayout = await PayoutService.createPayout(payload);

      setSelectedPayoutShop(null);
      await fetchShopSummaries(false);

      toast.success(`Payout #${createdPayout.id} created for ${shopName}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create payout");
    } finally {
      setCreatingPayout(false);
    }
  };

  if (loading) {
    return <div className="card bg-base-100 p-6">Loading payouts...</div>;
  }

  return (
    <div className="card bg-base-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Payout Management</h2>
        </div>

        {refreshing && (
          <span className="text-sm opacity-70">Refreshing...</span>
        )}
      </div>

      <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1 w-fit">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "payouts"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("payouts")}
        >
          Payouts
        </button>

        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "lookup"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("lookup")}
        >
          Lookup
        </button>
      </div>

      {activeTab === "payouts" ? (
        <div className="border-base-300 bg-base-100 sm:p-2 space-y-4">
          <div>
            <h3 className="text-base font-semibold">Payout Queue</h3>
            <p className="text-sm opacity-70">
              Review shops with payout-ready transaction rows for the selected
              year or month.
            </p>
          </div>

          <div className="bg-base-100 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Year</span>
                <select
                  className="select select-bordered w-full"
                  value={payoutYear}
                  onChange={(e) => setPayoutYear(Number(e.target.value))}
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
                  value={payoutMonth}
                  onChange={(e) => setPayoutMonth(e.target.value)}
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
                  value={payoutStatus}
                  onChange={(e) =>
                    setPayoutStatus(e.target.value as PayoutStatusFilter)
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
                  placeholder="Search by shop name or ID..."
                  className="input input-bordered w-full"
                  value={payoutSearch}
                  onChange={(e) => setPayoutSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {shops.length === 0 ? (
            <div className="rounded-lg border border-dashed border-base-300 p-4 text-sm opacity-70">
              No payout shops found for the selected filters.
            </div>
          ) : showPayoutMonthGroups ? (
            <div className="space-y-3">
              {payoutMonthGroups.map((group) => {
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
                          <p className="font-semibold text-base">
                            {group.label}
                          </p>
                          <p className="text-sm opacity-70">
                            {group.shops.length}{" "}
                            {group.shops.length === 1 ? "shop" : "shops"}
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
                      <div className="divide-y divide-base-200">
                        {group.shops.map((shop) => (
                          <PayoutShopRow
                            key={`${group.key}-${shop.shopId}`}
                            shopId={shop.shopId}
                            shopName={shop.shopName}
                            transactionCount={shop.transactionCount}
                            totalAmount={shop.totalAmount}
                            currency={shop.currency}
                            status={shop.status}
                            payoutId={shop.payoutId}
                            paidAt={shop.paidAt}
                            onView={() => handleViewShop(shop)}
                            onPayout={() => handlePayout(shop)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {shops.map((shop) => (
                <PayoutShopRow
                  key={shop.shopId}
                  shopId={shop.shopId}
                  shopName={shop.shopName}
                  transactionCount={shop.transactionCount}
                  totalAmount={shop.totalAmount}
                  currency={shop.currency}
                  status={shop.status}
                  payoutId={shop.payoutId}
                  paidAt={shop.paidAt}
                  onView={() => handleViewShop(shop)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className=" bg-base-100 space-y-4">
          <div>
            <h3 className="text-base font-semibold">Payout Lookup</h3>
            <p className="text-sm opacity-70">
              Inspect payout-related shop totals for a custom date range before
              real payout history actions are added.
            </p>
          </div>

          <div className="bg-base-100 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">From</span>
                <DatePicker
                  selected={lookupFromDate}
                  onChange={(date) => setLookupFromDate(date)}
                  dateFormat="yyyy-MM-dd"
                  maxDate={lookupToDate || undefined}
                  customInput={
                    <CustomDateInput
                      value={
                        lookupFromDate
                          ? lookupFromDate.toLocaleDateString("en-GB")
                          : ""
                      }
                      onClear={() => setLookupFromDate(null)}
                    />
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">To</span>
                <DatePicker
                  selected={lookupToDate}
                  onChange={(date) => setLookupToDate(date)}
                  dateFormat="yyyy-MM-dd"
                  minDate={lookupFromDate || undefined}
                  customInput={
                    <CustomDateInput
                      value={
                        lookupToDate
                          ? lookupToDate.toLocaleDateString("en-GB")
                          : ""
                      }
                      onClear={() => setLookupToDate(null)}
                    />
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <select
                  className="select select-bordered w-full"
                  value={lookupStatus}
                  onChange={(e) =>
                    setLookupStatus(e.target.value as PayoutStatusFilter)
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
                  placeholder="Search by shop name or ID..."
                  className="input input-bordered w-full"
                  value={lookupSearch}
                  onChange={(e) => setLookupSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {shops.length === 0 ? (
            <div className="rounded-lg border border-dashed border-base-300 p-4 text-sm opacity-70">
              No payout shops found for the selected filters.
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {shops.map((shop) => (
                <PayoutShopRow
                  key={shop.shopId}
                  shopId={shop.shopId}
                  shopName={shop.shopName}
                  transactionCount={shop.transactionCount}
                  totalAmount={shop.totalAmount}
                  currency={shop.currency}
                  status={shop.status}
                  payoutId={shop.payoutId}
                  paidAt={shop.paidAt}
                  showPayoutStatus={false}
                  onView={() => handleViewShop(shop)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedShop && (
        <PayoutShopModal
          shop={selectedShop}
          details={selectedShopDetails}
          periodSummary={getPeriodSummary(
            selectedShop.periodStart,
            selectedShop.periodEnd,
          )}
          loading={detailsLoading}
          onClose={() => {
            setSelectedShop(null);
            setSelectedShopDetails(null);
          }}
        />
      )}

      {selectedPayoutShop && (
        <AdminPayoutManualModal
          shop={selectedPayoutShop}
          periodStart={parseLocalDate(selectedPayoutShop.periodStart)}
          periodEnd={parseLocalDate(selectedPayoutShop.periodEnd)}
          saving={creatingPayout}
          onClose={() => setSelectedPayoutShop(null)}
          onSubmit={handleCreatePayout}
        />
      )}
    </div>
  );
}
