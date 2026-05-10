"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import AdminOrders from "@/components/admin/orders/AdminOrders";
import AdminPayouts from "@/components/admin/payouts/AdminPayouts";
import AdminSessions from "@/components/admin/sessions/AdminSessions";
import AdminShops from "@/components/admin/shops/AdminShops";
import StoreCustomizationSection from "@/components/admin/storeCustomization/StoreCustomizationSection";
import AdminTours from "@/components/admin/tours/AdminTours";
import AdminTransactions from "@/components/admin/transactions/AdminTransactions";
import AdminUsers from "@/components/admin/users/AdminUsers";
import RequireAuth from "@/components/common/RequireAuth";

const ADMIN_SECTIONS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "Users" },
  { id: "shops", label: "Shops" },
  { id: "storeCustomization", label: "Store Customization" },
  { id: "tours", label: "Tours" },
  { id: "sessions", label: "Sessions" },
  { id: "orders", label: "Orders" },
  { id: "transactions", label: "Transactions" },
  { id: "payouts", label: "Payouts" },
] as const;

type AdminSection = (typeof ADMIN_SECTIONS)[number]["id"];

export default function AdminPage() {
  const [active, setActive] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeSectionLabel =
    ADMIN_SECTIONS.find((section) => section.id === active)?.label ??
    "Dashboard";

  const renderContent = () => {
    switch (active) {
      case "users":
        return <AdminUsers />;
      case "shops":
        return <AdminShops />;
      case "storeCustomization":
        return <StoreCustomizationSection />;
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
        return <AdminDashboard />;
    }
  };

  const navItem = (key: AdminSection, label: string) => (
    <button
      key={key}
      onClick={() => {
        setActive(key);
        setSidebarOpen(false);
      }}
      className={`w-full rounded-lg px-4 py-2 text-left transition ${
        active === key
          ? "bg-primary text-white"
          : "text-base-content hover:bg-base-200"
      }`}
    >
      {label}
    </button>
  );

  const sidebar = (
    <div className="w-64 space-y-2 p-4">
      <h2 className="mb-4 text-lg font-bold">Admin</h2>
      {ADMIN_SECTIONS.map((section) => navItem(section.id, section.label))}
    </div>
  );

  return (
    <RequireAuth requiredRole="ADMIN">
      <div className="flex min-h-screen">
        <aside className="hidden shrink-0 border-r bg-base-100 sm:block">
          {sidebar}
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 z-50 h-full border-r bg-base-100"
              onClick={(event) => event.stopPropagation()}
            >
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 space-y-4 overflow-x-hidden">
          <div className="mt-4 flex items-center justify-between sm:hidden">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <h1 className="text-lg font-semibold">{activeSectionLabel}</h1>
            <div className="w-6" />
          </div>

          <h1 className="ml-4 mt-4 hidden text-2xl font-bold sm:block">
            {activeSectionLabel}
          </h1>

          {renderContent()}
        </main>
      </div>
    </RequireAuth>
  );
}
