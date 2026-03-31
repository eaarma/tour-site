"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  Activity,
  CalendarRange,
  CreditCard,
  ShoppingBag,
  Store,
  Ticket,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { UserService } from "@/lib/userService";
import { ShopService } from "@/lib/shopService";
import { TourService } from "@/lib/tourService";
import { TourSessionService } from "@/lib/tourSessionService";
import { OrderService } from "@/lib/orderService";
import { PaymentLineService } from "@/lib/paymentLineService";
import { OrderResponseDto } from "@/types/order";
import { TourSessionDto } from "@/types/tourSession";
import { UserResponseDto } from "@/types/user";
import { ShopDto } from "@/types/shop";
import { PaymentLineResponseDto } from "@/types/paymentLine";

type DashboardStats = {
  activeUsers: number;
  activeShops: number;
  activeTours: number;
  totalSessions: number;
  pendingSessions: number;
  totalOrders: number;
  pendingOrders: number;
  successfulTransactions: number;
};

type DashboardState = {
  stats: DashboardStats;
  recentOrders: OrderResponseDto[];
  recentSessions: TourSessionDto[];
  recentUsers: UserResponseDto[];
  recentShops: ShopDto[];
  recentTransactions: PaymentLineResponseDto[];
};

type MetricCardProps = {
  title: string;
  value: number | string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
};

const INITIAL_STATE: DashboardState = {
  stats: {
    activeUsers: 0,
    activeShops: 0,
    activeTours: 0,
    totalSessions: 0,
    pendingSessions: 0,
    totalOrders: 0,
    pendingOrders: 0,
    successfulTransactions: 0,
  },
  recentOrders: [],
  recentSessions: [],
  recentUsers: [],
  recentShops: [],
  recentTransactions: [],
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value: number, currency = "EUR") =>
  `${value.toFixed(2)} ${currency}`;

function MetricCard({ title, value, subtitle, accent, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-sm opacity-70">{subtitle}</p>
        </div>

        <div className={`rounded-2xl p-3 text-white shadow-sm ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const [
        activeUsersPage,
        recentUsersPage,
        activeShopsPage,
        recentShopsPage,
        activeToursPage,
        sessionsPage,
        pendingSessionsPage,
        ordersPage,
        pendingOrdersPage,
        transactionsPage,
      ] = await Promise.all([
        UserService.getAll({ status: "ACTIVE", page: 0, size: 1 }),
        UserService.getAll({ status: "ACTIVE", page: 0, size: 5 }),
        ShopService.getAll({ status: "ACTIVE", page: 0, size: 1 }),
        ShopService.getAll({ status: "ACTIVE", page: 0, size: 5 }),
        TourService.getAdminPage({ status: "ACTIVE", page: 0, size: 1 }),
        TourSessionService.getAdminPage({ page: 0, size: 5 }),
        TourSessionService.getAdminPage({
          status: "PENDING",
          page: 0,
          size: 1,
        }),
        OrderService.getAdminPage({ page: 0, size: 5 }),
        OrderService.getAdminPage({
          status: "PENDING",
          page: 0,
          size: 1,
        }),
        PaymentLineService.getAdminPage({
          status: "SUCCEEDED",
          page: 0,
          size: 5,
        }),
      ]);

      setData({
        stats: {
          activeUsers: activeUsersPage.totalElements ?? 0,
          activeShops: activeShopsPage.totalElements ?? 0,
          activeTours: activeToursPage.totalElements ?? 0,
          totalSessions: sessionsPage.totalElements ?? 0,
          pendingSessions: pendingSessionsPage.totalElements ?? 0,
          totalOrders: ordersPage.totalElements ?? 0,
          pendingOrders: pendingOrdersPage.totalElements ?? 0,
          successfulTransactions: transactionsPage.totalElements ?? 0,
        },
        recentOrders: ordersPage.content ?? [],
        recentSessions: sessionsPage.content ?? [],
        recentUsers: recentUsersPage.content ?? [],
        recentShops: recentShopsPage.content ?? [],
        recentTransactions: transactionsPage.content ?? [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
  }, []);

  if (loading) {
    return <div className="card bg-base-100 p-6">Loading dashboard...</div>;
  }

  const { stats } = data;

  return (
    <div className="mx-4 mb-4 space-y-6">
      <section className="rounded-3xl border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-base-200 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-60">
              Platform Overview
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Admin dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => fetchDashboard(false)}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active Users"
          value={stats.activeUsers}
          subtitle="Currently active accounts in the system"
          accent="bg-[#0f766e]"
          icon={<Users className="size-5" />}
        />
        <MetricCard
          title="Active Shops"
          value={stats.activeShops}
          subtitle="Merchant spaces available on the platform"
          accent="bg-[#b45309]"
          icon={<Store className="size-5" />}
        />
        <MetricCard
          title="Active Tours"
          value={stats.activeTours}
          subtitle="Listings currently available to sell"
          accent="bg-[#1d4ed8]"
          icon={<Ticket className="size-5" />}
        />
        <MetricCard
          title="Successful Transactions"
          value={stats.successfulTransactions}
          subtitle="Succeeded payment lines across the system"
          accent="bg-[#7c2d12]"
          icon={<CreditCard className="size-5" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Operations Snapshot</h3>
              <p className="mt-1 text-sm opacity-70">
                A few current workload signals pulled from sessions and orders.
              </p>
            </div>

            <div className="rounded-2xl bg-base-200 p-3 text-base-content/70">
              <Activity className="size-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-base-200/60 p-4">
              <p className="text-sm font-medium opacity-70">Total Sessions</p>
              <p className="mt-2 text-2xl font-bold">{stats.totalSessions}</p>
              <p className="mt-2 text-sm opacity-70">
                Pending sessions: {stats.pendingSessions}
              </p>
            </div>

            <div className="rounded-2xl bg-base-200/60 p-4">
              <p className="text-sm font-medium opacity-70">Total Orders</p>
              <p className="mt-2 text-2xl font-bold">{stats.totalOrders}</p>
              <p className="mt-2 text-sm opacity-70">
                Pending orders: {stats.pendingOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Recent Shops</h3>
              <p className="mt-1 text-sm opacity-70">
                A quick look at recently surfaced active shops.
              </p>
            </div>

            <div className="rounded-2xl bg-base-200 p-3 text-base-content/70">
              <Store className="size-5" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {data.recentShops.length === 0 ? (
              <p className="text-sm opacity-70">No shops to display.</p>
            ) : (
              data.recentShops.map((shop) => (
                <div
                  key={shop.id}
                  className="flex items-center justify-between rounded-xl bg-base-200/50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{shop.name}</p>
                    <p className="text-sm opacity-70">Shop #{shop.id}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wide opacity-60">
                    {shop.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <p className="mt-1 text-sm opacity-70">
                Latest orders entering the system.
              </p>
            </div>
            <ShoppingBag className="mt-1 size-5 text-base-content/60" />
          </div>

          <div className="mt-5 space-y-3">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm opacity-70">No orders to display.</p>
            ) : (
              data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl bg-base-200/50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm opacity-70">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wide opacity-60">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm opacity-80">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"} ·{" "}
                    {formatCurrency(order.totalPrice)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Recent Sessions</h3>
              <p className="mt-1 text-sm opacity-70">
                The latest session records and statuses.
              </p>
            </div>
            <CalendarRange className="mt-1 size-5 text-base-content/60" />
          </div>

          <div className="mt-5 space-y-3">
            {data.recentSessions.length === 0 ? (
              <p className="text-sm opacity-70">No sessions to display.</p>
            ) : (
              data.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl bg-base-200/50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {session.tourTitle}
                      </p>
                      <p className="text-sm opacity-70">
                        Session #{session.id}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wide opacity-60">
                      {session.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm opacity-80">
                    {session.date} · {session.time}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Recent Users</h3>
              <p className="mt-1 text-sm opacity-70">
                Newest active user accounts in the admin list.
              </p>
            </div>
            <Users className="mt-1 size-5 text-base-content/60" />
          </div>

          <div className="mt-5 space-y-3">
            {data.recentUsers.length === 0 ? (
              <p className="text-sm opacity-70">No users to display.</p>
            ) : (
              data.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl bg-base-200/50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name || "-"}</p>
                      <p className="truncate text-sm opacity-70">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wide opacity-60">
                      {user.role}
                    </span>
                  </div>
                  <p className="mt-2 text-sm opacity-80">
                    Created: {formatDateTime(user.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <p className="mt-1 text-sm opacity-70">
              Latest succeeded payment lines for a quick finance pulse.
            </p>
          </div>
          <CreditCard className="mt-1 size-5 text-base-content/60" />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Shop</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-sm opacity-70">
                    No transactions to display.
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.shopId}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.status}</td>
                    <td>
                      {formatCurrency(
                        transaction.shopAmount,
                        transaction.currency,
                      )}
                    </td>
                    <td>{formatDateTime(transaction.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
