"use client";

import Modal from "@/components/common/Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "@/components/common/CustomDateInput";
import { useEffect, useState } from "react";
import { TourScheduleService } from "@/lib/tourScheduleService";
import { TourService } from "@/lib/tourService";
import { Tour } from "@/types";
import toast from "react-hot-toast";
import { TourScheduleResponseDto } from "@/types/tourSchedule";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shopId: number;
  onCreated: () => void;
  scheduleToEdit?: TourScheduleResponseDto | null;
}

export default function ScheduleFormModal({
  isOpen,
  onClose,
  shopId,
  onCreated,
  scheduleToEdit,
}: Props) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState<number>(0);
  const isEditMode = !!scheduleToEdit;

  useEffect(() => {
    if (!scheduleToEdit) return;

    setSelectedTourId(scheduleToEdit.tourId);
    setDate(new Date(scheduleToEdit.date));
    setTime(
      scheduleToEdit.time
        ? new Date(`1970-01-01T${scheduleToEdit.time}`)
        : null,
    );
  }, [scheduleToEdit]);

  // 🔹 Load tours for dropdown
  useEffect(() => {
    if (!isOpen || !shopId) return;

    const loadTours = async () => {
      try {
        const data = await TourService.getByShopId(shopId);
        setTours(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tours.");
      }
    };

    loadTours();
  }, [isOpen, shopId]);

  useEffect(() => {
    if (!selectedTourId) {
      setMaxParticipants(0);
      return;
    }

    const selectedTour = tours.find((t) => t.id === selectedTourId);

    if (selectedTour) {
      setMaxParticipants(selectedTour.participants);
    }
  }, [selectedTourId, tours]);

  // 🔹 Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedTourId(null);
      setDate(null);
      setTime(null);
      setMaxParticipants(0);
    }
  }, [isOpen]);

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatLocalTime = (t: Date) => {
    const hours = String(t.getHours()).padStart(2, "0");
    const minutes = String(t.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async () => {
    if (!selectedTourId || !date || !time) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        tourId: selectedTourId,
        date: formatLocalDate(date),
        time: formatLocalTime(time),
      };

      if (isEditMode && scheduleToEdit) {
        await TourScheduleService.update(scheduleToEdit.id, payload);
        toast.success("Schedule updated.");
      } else {
        await TourScheduleService.create(payload);
        toast.success("Schedule created.");
      }

      onClose();
      onCreated();
    } catch {
      toast.error("Failed to save schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-6">Add Schedule</h2>

      <div className="space-y-4">
        {/* Tour */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Tour</label>
          <select
            className="select select-bordered w-full"
            value={selectedTourId ?? ""}
            onChange={(e) =>
              setSelectedTourId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Select tour</option>
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Date</label>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            dateFormat="yyyy-MM-dd"
            customInput={
              <CustomDateInput
                value={date ? date.toLocaleDateString("en-GB") : ""}
                onClear={() => setDate(null)}
              />
            }
          />
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Time</label>

          <DatePicker
            selected={time}
            onChange={(t) => setTime(t)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="HH:mm"
            placeholderText="Select time"
            className="input input-bordered w-full"
          />
        </div>
        {/* Capacity */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Capacity</label>

          <div className="input input-bordered w-full bg-base-200 text-foreground/80 cursor-not-allowed">
            {maxParticipants}
          </div>

          <span className="text-xs text-muted-foreground">
            Automatically derived from tour settings
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          className="btn btn-outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Schedule"
              : "Add Schedule"}
        </button>
      </div>
    </Modal>
  );
}
