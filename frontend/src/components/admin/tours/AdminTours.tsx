"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TourService } from "@/lib/tours/tourService";
import { Tour } from "@/types";
import toast from "react-hot-toast";
import Pagination from "../../common/Pagination";
import AdminTourModal from "./AdminTourModal";

const TOUR_STATUS_OPTIONS = ["ACTIVE", "ON_HOLD", "CANCELLED"] as const;
type TourStatus = (typeof TOUR_STATUS_OPTIONS)[number];

const getStatusDotClass = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500";
    case "ON_HOLD":
      return "bg-yellow-500";
    case "CANCELLED":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

export default function AdminTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TourStatus>("ACTIVE");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [editedStatus, setEditedStatus] = useState<TourStatus>("ACTIVE");
  const [saving, setSaving] = useState(false);
  const hasLoaded = useRef(false);
  const requestRef = useRef({ query, status, page });

  requestRef.current = { query, status, page };

  const openTour = (tour: Tour) => {
    setSelectedTour(tour);
    setEditedStatus((tour.status as TourStatus) || "ACTIVE");
  };

  const fetchTours = useCallback(async (initial = false) => {
    const currentRequest = requestRef.current;

    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const data = await TourService.getAdminPage({
        query: currentRequest.query,
        status: currentRequest.status,
        page: currentRequest.page,
        size: 10,
      });

      setTours(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tours");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTours(true).finally(() => {
      hasLoaded.current = true;
    });
  }, [fetchTours]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    const timeout = setTimeout(() => {
      fetchTours(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchTours, page, query, status]);

  useEffect(() => {
    if (totalPages === 0 && page !== 0) {
      setPage(0);
      return;
    }

    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const handleSaveStatus = async () => {
    if (!selectedTour) return;

    if (selectedTour.status === editedStatus) {
      toast("No changes made");
      return;
    }

    try {
      setSaving(true);

      const updatedTour = await TourService.updateStatus(
        selectedTour.id,
        editedStatus,
      );

      setSelectedTour(updatedTour);
      setEditedStatus(updatedTour.status as TourStatus);
      await fetchTours(false);

      toast.success("Tour status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update tour status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card bg-base-100 p-6">Loading tours...</div>;
  }

  return (
    <div className="card bg-base-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tour Management</h2>
        {refreshing && (
          <span className="text-sm opacity-70">Refreshing...</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name..."
          className="input input-bordered w-full sm:max-w-sm"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />

        <select
          className="select select-bordered w-full sm:w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TourStatus);
            setPage(0);
          }}
        >
          {TOUR_STATUS_OPTIONS.map((tourStatus) => (
            <option key={tourStatus} value={tourStatus}>
              {tourStatus}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>ID</th>
              <th>Name</th>
              <th>Shop</th>
              <th>Type</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tours.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 opacity-70">
                  No tours found.
                </td>
              </tr>
            ) : (
              tours.map((tour) => (
                <tr key={tour.id}>
                  <td>
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${getStatusDotClass(
                        tour.status,
                      )}`}
                      title={tour.status}
                    />
                  </td>
                  <td>{tour.id}</td>
                  <td>{tour.title}</td>
                  <td>{tour.shopName || `Shop #${tour.shopId}`}</td>
                  <td>{tour.type}</td>
                  <td className="text-right">
                    <button
                      className="btn btn-sm"
                      onClick={() => openTour(tour)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedTour && (
        <AdminTourModal
          tour={selectedTour}
          editedStatus={editedStatus}
          setEditedStatus={setEditedStatus}
          saving={saving}
          onClose={() => setSelectedTour(null)}
          onSaveStatus={handleSaveStatus}
        />
      )}
    </div>
  );
}

