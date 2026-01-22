"use client";

import { TourScheduleService } from "@/lib/tourScheduleService";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

interface EditableSchedulesProps {
  tourId: number;
  isEditing: boolean;
  participants: number;
}

export default function EditableSchedules({
  tourId,
  isEditing,
  participants,
}: EditableSchedulesProps) {
  const [schedules, setSchedules] = useState<TourScheduleResponseDto[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<Date | null>(null);

  // Group helper
  const groupByDate = (list: TourScheduleResponseDto[]) =>
    list.reduce<Record<string, TourScheduleResponseDto[]>>((acc, s) => {
      (acc[s.date] ||= []).push(s);
      return acc;
    }, {});

  // Derived: schedules grouped by date + sorted date keys (asc)
  const schedulesByDate = useMemo(() => groupByDate(schedules), [schedules]);
  const dateKeys = useMemo(
    () => Object.keys(schedulesByDate).sort(),
    [schedulesByDate],
  );

  // Initial load
  useEffect(() => {
    const load = async () => {
      try {
        const data = await TourScheduleService.getByTourId(tourId);
        setSchedules(data);
      } catch (err) {
        console.error("Failed to load schedules", err);
      }
    };
    load();
  }, [tourId]);

  // Keep selectedDate valid whenever schedules change
  useEffect(() => {
    if (!dateKeys.length) {
      setSelectedDate(null);
      return;
    }
    if (!selectedDate || !dateKeys.includes(selectedDate)) {
      setSelectedDate(dateKeys[0]);
    }
  }, [dateKeys, selectedDate]);

  const handleAdd = async () => {
    if (!newDate || !newTime) return;

    const combined = new Date(newDate);
    combined.setHours(newTime.getHours(), newTime.getMinutes(), 0, 0);

    if (combined < new Date()) {
      toast.error("Selected time is in the past.");
      return;
    }

    const formattedDate = `${newDate.getFullYear()}-${String(
      newDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(newDate.getDate()).padStart(2, "0")}`;

    const formattedTime = newTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const created = await TourScheduleService.create({
        tourId,
        date: formattedDate,
        time: formattedTime,
        maxParticipants: participants,
      });
      setSchedules((prev) => [...prev, created]);
      setNewDate(null);
      setNewTime(null);
      setSelectedDate(formattedDate); // focus the date we just added
    } catch (err) {
      console.error("Failed to add schedule", err);
      toast.error("Failed to add schedule.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Optimistically compute next state to fix selectedDate immediately
      setSchedules((prev) => {
        const next = prev.filter((s) => s.id !== id);
        const nextByDate = groupByDate(next);
        // If current selectedDate vanished, pick first available or null
        if (selectedDate && !nextByDate[selectedDate]) {
          const nextDates = Object.keys(nextByDate).sort();
          setSelectedDate(nextDates[0] ?? null);
        }
        return next;
      });

      await TourScheduleService.delete(id);
    } catch (err) {
      console.error("Failed to delete schedule", err);
      toast.error("Failed to delete schedule.");
      // (Optional) reload to ensure consistency:
      // const data = await TourScheduleService.getByTourId(tourId);
      // setSchedules(data);
    }
  };

  const timesForSelected = selectedDate
    ? (schedulesByDate[selectedDate] ?? [])
    : [];

  return (
    <div>
      <h3 className="font-semibold mb-2">Available Dates</h3>

      {/* Date dropdown */}
      <select
        className="select select-bordered w-full max-w-xs mb-4"
        value={selectedDate ?? ""}
        onChange={(e) => setSelectedDate(e.target.value || null)}
      >
        {!dateKeys.length && <option value="">No dates available</option>}
        {dateKeys.map((date) => (
          <option key={date} value={date}>
            {date}
          </option>
        ))}
      </select>

      {/* Times for selected date */}
      {selectedDate && (
        <>
          <h4 className="font-medium mb-2">Available Times</h4>
          {timesForSelected.length ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {timesForSelected.map((s) => (
                <span
                  key={s.id}
                  className="badge badge-outline flex items-center gap-1"
                >
                  {s.time}
                  {isEditing && (
                    <button
                      type="button"
                      className="ml-1 text-xs text-error"
                      onClick={() => handleDelete(s.id)}
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-4">
              No times for this date.
            </div>
          )}
        </>
      )}

      {/* Edit controls */}
      {isEditing && (
        <div className="flex flex-wrap gap-2 items-center">
          <DatePicker
            selected={newDate}
            onChange={(date) => setNewDate(date)}
            dateFormat="dd.MM.yyyy"
            placeholderText="Select date"
            className="input input-bordered"
          />

          <DatePicker
            selected={newTime}
            onChange={(time) => setNewTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="HH:mm"
            placeholderText="Select time"
            className="input input-bordered"
          />

          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleAdd}
          >
            Add time
          </button>
        </div>
      )}
    </div>
  );
}
