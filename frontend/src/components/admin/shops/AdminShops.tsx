"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import Pagination from "../../common/Pagination";
import { ShopService } from "@/lib/shops/shopService";
import { ShopDto } from "@/types/shop";
import AdminShopModal from "./AdminShopModal";
import AdminShopStatusModal from "./AdminShopStatusModal";

type ShopStatus = "ACTIVE" | "DISABLED" | "REMOVED";

export default function AdminShops() {
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ShopStatus>("ACTIVE");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const hasLoadedOnce = useRef(false);

  const [selectedShop, setSelectedShop] = useState<ShopDto | null>(null);
  const [statusModalShop, setStatusModalShop] = useState<ShopDto | null>(null);
  const [settingStatus, setSettingStatus] = useState(false);

  useEffect(() => {
    let isActive = true;
    const isInitialLoad = !hasLoadedOnce.current;

    const timeout = setTimeout(
      async () => {
        try {
          if (isInitialLoad) setLoading(true);
          else setRefreshing(true);

          const data = await ShopService.getAll({
            query,
            status,
            page,
            size: 10,
          });

          if (!isActive) return;

          setShops(data.content);
          setTotalPages(data.totalPages);
        } catch (err) {
          if (!isActive) return;
          console.error(err);
          toast.error("Failed to load shops");
        } finally {
          if (!isActive) return;
          hasLoadedOnce.current = true;
          setLoading(false);
          setRefreshing(false);
        }
      },
      isInitialLoad ? 0 : 300,
    );

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [page, query, status]);

  const openStatusModal = () => {
    if (!selectedShop) return;
    setStatusModalShop(selectedShop);
  };

  const handleSetStatus = async (payload: {
    status: ShopStatus;
    statusReason?: string;
  }) => {
    if (!statusModalShop) return;

    try {
      setSettingStatus(true);

      await ShopService.setStatus(statusModalShop.id, payload);

      const updatedShop = {
        ...statusModalShop,
        status: payload.status,
        statusReason: payload.statusReason,
        statusChangedAt: new Date().toISOString(),
      };

      if (status !== payload.status) {
        setShops((prev) =>
          prev.filter((shop) => shop.id !== statusModalShop.id),
        );
      } else {
        setShops((prev) =>
          prev.map((shop) =>
            shop.id === statusModalShop.id ? updatedShop : shop,
          ),
        );
      }

      setSelectedShop((prev) =>
        prev && prev.id === statusModalShop.id ? updatedShop : prev,
      );

      setStatusModalShop(null);
      toast.success(`Shop status set to ${payload.status.toLowerCase()}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update shop status");
    } finally {
      setSettingStatus(false);
    }
  };

  if (loading) {
    return <div className="card bg-base-100 p-6">Loading shops...</div>;
  }

  return (
    <div className="card bg-base-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Shop Management</h2>
        {refreshing ? (
          <span className="text-sm opacity-70">Refreshing...</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by ID or name..."
          className="input input-bordered w-full sm:max-w-sm"
          value={query}
          onChange={(event) => {
            setPage(0);
            setQuery(event.target.value);
          }}
        />

        <select
          className="select select-bordered w-full sm:w-48"
          value={status}
          onChange={(event) => {
            setPage(0);
            setStatus(event.target.value as ShopStatus);
          }}
        >
          <option value="ACTIVE">Active Shops</option>
          <option value="DISABLED">Disabled Shops</option>
          <option value="REMOVED">Removed Shops</option>
        </select>
      </div>

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
                    className={`inline-block h-3 w-3 rounded-full ${
                      shop.status === "ACTIVE"
                        ? "bg-success"
                        : shop.status === "DISABLED"
                          ? "bg-warning"
                          : "bg-error"
                    }`}
                  />
                </td>

                <td>{shop.id}</td>
                <td>{shop.name}</td>
                <td>{shop.description || "-"}</td>

                <td className="text-right">
                  <button
                    type="button"
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selectedShop ? (
        <AdminShopModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onSetStatus={openStatusModal}
          setting={settingStatus}
        />
      ) : null}

      {statusModalShop ? (
        <AdminShopStatusModal
          shop={statusModalShop}
          setting={settingStatus}
          onClose={() => setStatusModalShop(null)}
          onConfirm={handleSetStatus}
        />
      ) : null}
    </div>
  );
}
