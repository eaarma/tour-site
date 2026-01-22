"use client";

import Modal from "../common/Modal";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tour } from "@/types";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import toast from "react-hot-toast";
import { TourScheduleService } from "@/lib/tourScheduleService";
import SchedulePicker from "./SchedulePicker";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Tour;
  selectedSchedule?: TourScheduleResponseDto | null;
  schedules?: TourScheduleResponseDto[];
}

export default function BookingModal({
  isOpen,
  onClose,
  item,
  selectedSchedule,
  schedules = [],
}: BookingModalProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [comment, setComment] = useState("");

  const [chosenSchedule, setChosenSchedule] =
    useState<TourScheduleResponseDto | null>(selectedSchedule ?? null);

  const [localSchedules, setLocalSchedules] =
    useState<TourScheduleResponseDto[]>(schedules);

  useEffect(() => {
    setChosenSchedule(selectedSchedule ?? null);
  }, [selectedSchedule]);

  useEffect(() => {
    setLocalSchedules(schedules);
  }, [schedules]);

  const [participants, setParticipants] = useState<number>(1);

  const handleRemoveUnavailable = (id: number) => {
    setLocalSchedules((prev) => prev.filter((s) => s.id !== id));
    if (chosenSchedule?.id === id) {
      setChosenSchedule(null);
    }
  };

  const handleAddToCart = async (): Promise<boolean> => {
    if (!chosenSchedule) {
      toast.error("Please choose a time first.");
      return false;
    }
    if (!participants) {
      toast.error("Please choose number of participants.");
      return false;
    }

    try {
      const latest = await TourScheduleService.getById(chosenSchedule.id);

      if (!latest || latest.status !== "ACTIVE") {
        handleRemoveUnavailable(chosenSchedule.id);
        toast.error(
          "Selected time is no longer available. Please pick another.",
        );
        return false;
      }

      dispatch(
        addItemToCart({
          cartItemId: crypto.randomUUID(),
          id: item.id.toString(),
          title: item.title,
          price: Number(item.price),
          participants,
          images: item.images,
          selected: true,
          scheduleId: chosenSchedule.id,
          selectedDate: chosenSchedule.date,
          selectedTime: chosenSchedule.time || "",
          availableLanguages: item.language,
          preferredLanguage: preferredLanguage || undefined,
          comment: comment || undefined,
        }),
      );

      toast.success(`${item.title} added to cart`);
      onClose();
      return true;
    } catch (err) {
      console.error("Error checking schedule availability:", err);
      toast.error("Could not verify schedule availability. Try again.");
      return false;
    }
  };

  const handleBookNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      router.push("/cart");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2
        className="text-2xl font-bold mb-4"
        id="booking-modal-title"
        aria-label={`Booking modal for ${item.title}`}
      >
        {item.title}
      </h2>
      <p className="mb-4">Price: {item.price} €</p>

      {/* ✅ Reused SchedulePicker */}
      <SchedulePicker
        schedules={localSchedules}
        selectedScheduleId={chosenSchedule?.id}
        onSelect={setChosenSchedule}
        className="mb-4"
      />

      {/* Participants dropdown */}
      <div className="mb-4">
        <label
          className="block font-semibold mb-2"
          htmlFor="participants-select"
        >
          Participants
        </label>
        <select
          id="participants-select"
          className="select select-bordered w-32"
          value={participants}
          onChange={(e) => setParticipants(Number(e.target.value))}
        >
          {Array.from({ length: item.participants || 1 }, (_, i) => i + 1).map(
            (n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ),
          )}
        </select>
      </div>
      {/* 🔹 Preferred Language */}
      {item.language && (
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

      <div className="flex justify-between mt-6">
        <button
          className="btn btn-secondary"
          onClick={handleAddToCart}
          disabled={!chosenSchedule}
        >
          Add to Cart
        </button>

        <button
          className="btn btn-primary"
          onClick={handleBookNow}
          disabled={!chosenSchedule}
        >
          Book Now
        </button>
      </div>
    </Modal>
  );
}
