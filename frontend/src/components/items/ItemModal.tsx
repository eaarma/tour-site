"use client";

import Modal from "../common/Modal";
import { useEffect, useState } from "react";
import { Tour } from "@/types";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import SchedulePicker from "./SchedulePicker";
import { useDispatch } from "react-redux";
import { updateItemSchedule } from "@/store/cartSlice";
import toast from "react-hot-toast";
import { tourScheduleService } from "@/lib/tourScheduleService";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Tour;
  cartItemId: string;
  schedules?: TourScheduleResponseDto[];
  initialScheduleId?: number;
  initialParticipants?: number;
  initialPreferredLanguage?: string;
  language: string[];
  initialComment?: string;
}

export default function ItemModal({
  isOpen,
  onClose,
  item,
  cartItemId,
  schedules,
  initialComment,
  initialPreferredLanguage,
  initialScheduleId,
  initialParticipants = 1,
}: Props) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [localSchedules, setLocalSchedules] = useState<
    TourScheduleResponseDto[]
  >([]);
  const [selectedSchedule, setSelectedSchedule] =
    useState<TourScheduleResponseDto | null>(null);
  const [participants, setParticipants] = useState(initialParticipants);
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [comment, setComment] = useState("");

  // 1) If parent provides schedules, sync them once (or when identity changes)
  useEffect(() => {
    if (Array.isArray(schedules)) {
      setLocalSchedules(schedules);
    }
  }, [schedules]);

  // 2) If no schedules provided, fetch them (when modal opens / item changes)
  useEffect(() => {
    if (!isOpen) return;
    if (Array.isArray(schedules) && schedules.length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await tourScheduleService.getByTourId(item.id);
        if (!cancelled) setLocalSchedules(data);
      } catch (e) {
        console.error("Failed to load schedules in ItemModal", e);
        if (!cancelled) setLocalSchedules([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, item.id, schedules]);

  // 3) Initialize selected schedule when we have schedules
  useEffect(() => {
    if (!initialScheduleId) return;
    if (!localSchedules.length) return;
    const found =
      localSchedules.find((s) => s.id === initialScheduleId) ?? null;
    setSelectedSchedule(found);
  }, [initialScheduleId, localSchedules]);

  const handleUpdate = () => {
    if (!selectedSchedule) {
      toast.error("Please choose a schedule first.");
      return;
    }
    if (!participants) {
      toast.error("Please choose participants.");
      return;
    }

    dispatch(
      updateItemSchedule({
        cartItemId,
        scheduleId: selectedSchedule.id,
        date: selectedSchedule.date,
        time: selectedSchedule.time || "",
        participants,

        preferredLanguage: preferredLanguage || undefined,
        comment: comment || undefined,
      })
    );

    toast.success("Cart item updated ✅");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    setPreferredLanguage(initialPreferredLanguage ?? "");
    setComment(initialComment ?? "");
  }, [isOpen, initialPreferredLanguage, initialComment]);

  const viewTour = () => {
    router.push(`/items/${item.id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
      <p className="mb-4">Price: {item.price} €</p>

      <SchedulePicker
        schedules={localSchedules}
        selectedScheduleId={selectedSchedule?.id}
        onSelect={setSelectedSchedule}
        className="mb-4"
      />

      <div className="mb-4">
        <label className="block font-semibold mb-2" htmlFor="participants">
          Participants
        </label>
        <select
          id="participants"
          className="select select-bordered w-32"
          value={participants}
          onChange={(e) => setParticipants(Number(e.target.value))}
        >
          {Array.from({ length: item.participants || 1 }, (_, i) => i + 1).map(
            (n) => (
              <option key={n} value={n}>
                {n}
              </option>
            )
          )}
        </select>
      </div>
      {/* 🔹 Preferred Language */}
      {item.language && item.language.length > 0 && (
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Preferred Language (optional)
          </label>

          <select
            className="select select-bordered w-full"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
          >
            <option value="">No preference</option>
            {item.language.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 🔹 Comment */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Comment (optional)</label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Anything the guide should know?"
        />
      </div>

      <div className="flex justify-end mt-6">
        <button className="btn btn-secondary mr-4" onClick={viewTour}>
          View Tour
        </button>

        <button
          className="btn btn-primary"
          onClick={handleUpdate}
          disabled={!selectedSchedule}
        >
          Update Cart
        </button>
      </div>
    </Modal>
  );
}
