"use client";

import { useState } from "react";
import RequireAuth from "@/components/common/RequireAuth";

import AdminUsers from "@/components/admin/AdminUsers";
import AdminShops from "@/components/admin/AdminShops";
import AdminTours from "@/components/admin/AdminTours";
import AdminSessions from "@/components/admin/AdminSessions";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminTransactions from "@/components/admin/AdminTransactions";
import AdminPayouts from "@/components/admin/AdminPayouts";

import { Menu } from "lucide-react";

type AdminSection =
  | "dashboard"
  | "users"
  | "shops"
  | "tours"
  | "sessions"
  | "orders"
  | "transactions"
  | "payouts";

export default function AdminPage() {
  const [active, setActive] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (active) {
      case "users":
        return <AdminUsers />;
      case "shops":
        return <AdminShops />;
      case "tours":
        return <AdminTours />;
      case "sessions":
        return <AdminSessions />;
      case "orders":
        return <AdminOrders />;
      case "transactions":
        return <AdminTransactions />;
      case "payouts":
        return <AdminPayouts />;
      default:
        return (
          <div className="card bg-base-200 p-6 mt-4 ml-4 mb-4">
            <h2 className="text-xl font-semibold">Welcome Admin 👋</h2>
            <p className="opacity-70">
              Select a section from the sidebar to manage the platform.
            </p>
          </div>
        );
    }
  };

  const navItem = (key: AdminSection, label: string) => (
    <button
      key={key}
      onClick={() => {
        setActive(key);
        setSidebarOpen(false); // close on mobile click
      }}
      className={`w-full text-left px-4 py-2 rounded-lg transition ${
        active === key
          ? "bg-primary text-white"
          : "hover:bg-base-200 text-base-content"
      }`}
    >
      {label}
    </button>
  );

  const Sidebar = (
    <div className="w-64 p-4 space-y-2">
      <h2 className="text-lg font-bold mb-4">Admin</h2>

      {navItem("dashboard", "Dashboard")}
      {navItem("users", "Users")}
      {navItem("shops", "Shops")}
      {navItem("tours", "Tours")}
      {navItem("sessions", "Sessions")}
      {navItem("orders", "Orders")}
      {navItem("transactions", "Transactions")}
      {navItem("payouts", "Payouts")}
    </div>
  );

  return (
    <RequireAuth requiredRole="ADMIN">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden shrink-0 border-r bg-base-100 sm:block">
          {Sidebar}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 z-50 h-full border-r bg-base-100"
              onClick={(e) => e.stopPropagation()}
            >
              {Sidebar}
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 w-full space-y-4 overflow-x-hidden">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between sm:hidden mt-4">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <h1 className="text-lg font-semibold capitalize">{active}</h1>
            <div className="w-6" /> {/* spacer */}
          </div>

          {/* Desktop title */}
          <h1 className="hidden sm:block text-2xl font-bold capitalize ml-4 mt-4">
            {active}
          </h1>

          {renderContent()}
        </main>
      </div>
    </RequireAuth>
  );
}
