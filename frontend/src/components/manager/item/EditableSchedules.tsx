"use client";

import { TourScheduleService } from "@/lib/tourScheduleService";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

interface EditableSchedulesProps {
  tourId: number;
  isEditing: boolean;
}

export default function EditableSchedules({
  tourId,
  isEditing,
}: EditableSchedulesProps) {
  const [schedules, setSchedules] = useState<TourScheduleResponseDto[]>([]);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<Date | null>(null);
  const [newParticipants, setNewParticipants] = useState(10);

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

  const handleAdd = async () => {
    if (!newDate || !newTime) return;

    // Merge date and time into one Date object
    const combined = new Date(newDate);
    combined.setHours(newTime.getHours(), newTime.getMinutes(), 0, 0);

    // Check if in the past
    if (combined < new Date()) {
      toast.error("Selected time is in the past and cannot be added.");
      return;
    }

    // Format date in local time
    const formattedDate = `${newDate.getFullYear()}-${String(
      newDate.getMonth() + 1
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
        maxParticipants: newParticipants,
      });
      setSchedules((prev) => [...prev, created]);
      setNewDate(null);
      setNewTime(null);
      setNewParticipants(10);
    } catch (err) {
      console.error("Failed to add schedule", err);
      toast.error("Failed to add schedule.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await TourScheduleService.delete(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Available Times</h3>

      {/* Always show bubbles (preview) */}
      <div className="flex flex-wrap gap-2 mb-3">
        {schedules.map((s) => (
          <span
            key={s.id}
            className="badge badge-outline flex items-center gap-1"
          >
            {s.date} {s.time}
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
        {schedules.length === 0 && (
          <span className="text-gray-500">No schedules yet</span>
        )}
      </div>

      {/* Input only in edit mode */}
      {isEditing && (
        <div className="flex flex-wrap gap-2 items-center">
          {/* Date Picker */}
          <DatePicker
            selected={newDate}
            onChange={(date) => setNewDate(date)}
            dateFormat="dd.MM.yyyy"
            placeholderText="Select date"
            className="input input-bordered"
          />

          {/* Time Picker */}
          <DatePicker
            selected={newTime}
            onChange={(time) => setNewTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15} // pick every 15 minutes
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
