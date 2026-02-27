"use client";

import { TourScheduleService } from "@/lib/tourScheduleService";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ScheduleDateView from "./ScheduleDateView";
import ScheduleTourView from "./ScheduleTourView";
import DatePicker from "react-datepicker";
import CustomDateInput from "@/components/common/CustomDateInput";
import { Plus } from "lucide-react";
import ScheduleFormModal from "./ScheduleFormModal";
import { useSessionManager } from "@/hooks/useSessionManager";
import SessionDetailsModal from "../session/SessionDetailsModal";

interface ManagerScheduleSectionProps {
  shopId: number;
}

export default function ManagerScheduleSection({
  shopId,
}: ManagerScheduleSectionProps) {
  const [viewMode, setViewMode] = useState<"DATE" | "TOUR">("DATE");
  const [schedules, setSchedules] = useState<TourScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] =
    useState<TourScheduleResponseDto | null>(null);

  // Placeholder filter states (we'll wire them later)
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const {
    sessionList,
    selectedSessionId,
    setSelectedSessionId,
    confirmSession,
    completeSession,
    updateLocalSession,
  } = useSessionManager(shopId);

  const loadSchedules = async () => {
    if (!shopId) return;

    try {
      setLoading(true);
      const data = await TourScheduleService.getByShopId(shopId);
      setSchedules(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [shopId]);

  const uniqueTours = Array.from(
    new Map(schedules.map((s) => [s.tourId, s.tourTitle])).entries(),
  )
    .map(([id, title]) => ({
      id,
      title,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const filteredSchedules = schedules.filter((s) => {
    const scheduleDate = new Date(s.date);

    // FROM filter
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (scheduleDate < from) return false;
    }

    // TO filter
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (scheduleDate > to) return false;
    }

    // TOUR filter
    if (selectedTourId && s.tourId !== selectedTourId) {
      return false;
    }

    // STATUS filter
    if (statusFilter.length > 0 && !statusFilter.includes(s.status)) {
      return false;
    }

    return true;
  });

  const openEditModal = (schedule: TourScheduleResponseDto) => {
    setScheduleToEdit(schedule);
    setAddModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await TourScheduleService.delete(id);
      toast.success("Schedule deleted.");
      loadSchedules();
    } catch {
      toast.error("Failed to delete schedule.");
    }
  };

  const handleViewSession = (schedule: TourScheduleResponseDto) => {
    const session = sessionList.find((s) => s.scheduleId === schedule.id);

    if (!session) {
      toast.error("No session found for this schedule.");
      return;
    }

    setSelectedSessionId(session.id);
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Schedules</h2>
        <p className="text-sm text-muted-foreground">
          Manage tour availability, times and capacity.
        </p>
      </div>

      {/* ================= VIEW TOGGLE ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1">
          <button
            onClick={() => setViewMode("DATE")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === "DATE"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Date View
          </button>

          <button
            onClick={() => setViewMode("TOUR")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === "TOUR"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Tour View
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* From Date */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">From</span>
            <DatePicker
              selected={fromDate}
              onChange={(d) => setFromDate(d)}
              dateFormat="yyyy-MM-dd"
              customInput={
                <CustomDateInput
                  value={fromDate ? fromDate.toLocaleDateString("en-GB") : ""}
                  onClear={() => setFromDate(null)}
                />
              }
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">To</span>
            <DatePicker
              selected={toDate}
              onChange={(d) => setToDate(d)}
              dateFormat="yyyy-MM-dd"
              customInput={
                <CustomDateInput
                  value={toDate ? toDate.toLocaleDateString("en-GB") : ""}
                  onClear={() => setToDate(null)}
                />
              }
            />
          </div>

          {/* Tour Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Tour</label>
            <select
              className="select  select-sm w-full sm:w-auto h-10
                hover:border-border hover:outline-none hover:ring-2 hover:ring-ring/30 hover:ring-primary/20
                focus:border-border focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-primary"
              value={selectedTourId ?? ""}
              onChange={(e) =>
                setSelectedTourId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            >
              <option value="">All tours</option>

              {uniqueTours.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <select
              className="select  select-sm w-full sm:w-auto h-10
                hover:border-border hover:outline-none hover:ring-2 hover:ring-ring/30 hover:ring-primary/20
                focus:border-border focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-primary"
              value={statusFilter[0] ?? ""}
              onChange={(e) =>
                setStatusFilter(e.target.value ? [e.target.value] : [])
              }
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="BOOKED">BOOKED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              type="button"
              className="btn btn-sm btn-outline w-full h-10 hover:border-primary hover:text-primary transition-colors sm:mr-5"
              onClick={() => {
                setFromDate(null);
                setToDate(null);
                setSelectedTourId(null);
                setStatusFilter([]);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <button
        className="btn btn-sm btn-primary rounded-lg"
        onClick={() => setAddModalOpen(true)}
      >
        <Plus />
        Add Schedule
      </button>

      {/* ================= VIEW CONTENT ================= */}
      <div>
        {loading ? (
          <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
            <p className="text-muted-foreground">Loading schedules...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
            <p className="text-muted-foreground">No schedules created yet.</p>
          </div>
        ) : viewMode === "DATE" ? (
          <ScheduleDateView
            schedules={filteredSchedules}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onViewSession={handleViewSession}
          />
        ) : (
          <ScheduleTourView
            schedules={filteredSchedules}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onViewSession={handleViewSession}
          />
        )}
      </div>

      <ScheduleFormModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setScheduleToEdit(null);
        }}
        shopId={shopId}
        onCreated={loadSchedules}
        scheduleToEdit={scheduleToEdit}
      />

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
