"use client";

import RequireAuth from "@/components/common/RequireAuth";

export default function AdminPage() {
  return (
    <RequireAuth requiredRole="ADMIN">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-base-200 p-4">Users</div>
          <div className="card bg-base-200 p-4">Shops</div>
          <div className="card bg-base-200 p-4">Tours</div>
          <div className="card bg-base-200 p-4">Bookings</div>
          <div className="card bg-base-200 p-4">Payouts</div>
        </div>
      </div>
    </RequireAuth>
  );
}
