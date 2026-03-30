"use client";

import { useEffect, useState } from "react";
import { ShopService } from "@/lib/shopService";
import { ShopDto } from "@/types/shop";
import toast from "react-hot-toast";
import Pagination from "../common/Pagination";
import AdminShopModal from "./AdminShopModal";

export default function AdminShops() {
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "REMOVED">("ACTIVE");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedShop, setSelectedShop] = useState<ShopDto | null>(null);
  const [removing, setRemoving] = useState(false);

  const fetchShops = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const data = await ShopService.getAll({
        query,
        status,
        page,
        size: 10,
      });

      setShops(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShops(true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchShops(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, status, page]);

  const handleRemove = async () => {
    if (!selectedShop) return;
    if (!confirm("Are you sure you want to remove this shop?")) return;

    try {
      setRemoving(true);

      await ShopService.remove(selectedShop.id);

      if (status === "ACTIVE") {
        setShops((prev) => prev.filter((s) => s.id !== selectedShop.id));
      } else {
        setShops((prev) =>
          prev.map((s) =>
            s.id === selectedShop.id ? { ...s, status: "REMOVED" } : s,
          ),
        );
      }

      setSelectedShop(null);
      toast.success("Shop removed");
    } catch {
      toast.error("Failed to remove shop");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return <div className="card bg-base-100 p-6">Loading shops...</div>;
  }

  return (
    <div className="card bg-base-100 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Shop Management</h2>
        {refreshing && (
          <span className="text-sm opacity-70">Refreshing...</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by ID or name..."
          className="input input-bordered w-full sm:max-w-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="select select-bordered w-full sm:w-48"
          value={status}
          onChange={(e) => setStatus(e.target.value as "ACTIVE" | "REMOVED")}
        >
          <option value="ACTIVE">Active Shops</option>
          <option value="REMOVED">Removed Shops</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {shops.map((shop) => (
              <tr key={shop.id}>
                <td>
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      shop.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </td>

                <td>{shop.id}</td>
                <td>{shop.name}</td>
                <td>{shop.description || "-"}</td>

                <td className="text-right">
                  <button
                    className="btn btn-sm"
                    onClick={() => setSelectedShop(shop)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal */}
      {selectedShop && (
        <AdminShopModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onRemove={handleRemove}
          removing={removing}
        />
      )}
    </div>
  );
}
