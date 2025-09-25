"use client";

import Modal from "../common/Modal";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Item } from "@/types";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import toast from "react-hot-toast";
import { TourScheduleService } from "@/lib/tourScheduleService";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
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

  const [chosenSchedule, setChosenSchedule] =
    useState<TourScheduleResponseDto | null>(selectedSchedule ?? null);

  // local copy of schedules so we can remove unavailable ones
  const [localSchedules, setLocalSchedules] =
    useState<TourScheduleResponseDto[]>(schedules);

  // keep chosenSchedule in sync if parent selection changes
  useEffect(() => {
    setChosenSchedule(selectedSchedule ?? null);
  }, [selectedSchedule]);

  // keep local schedules in sync when prop changes
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

  // Check & add to cart
  const handleAddToCart = async () => {
    if (!chosenSchedule) {
      toast.error("Please choose a time first.");
      return;
    }

    if (!participants) {
      toast.error("Please choose number of participants.");
      return;
    }

    try {
      // Re-fetch the schedule from backend to confirm it's still active
      const latest = await TourScheduleService.getById(chosenSchedule.id);

      if (!latest || latest.status !== "ACTIVE") {
        // remove it from the shown list and clear selection
        handleRemoveUnavailable(chosenSchedule.id);

        toast.error(
          "Selected time is no longer available. Please pick another."
        );
        return;
      }

      // success -> add to cart
      dispatch(
        addItemToCart({
          id: item.id.toString(),
          title: item.title,
          price: Number(item.price),
          participants,
          scheduleId: chosenSchedule.id,
          selectedDate: chosenSchedule.date,
          selectedTime: chosenSchedule.time || "",
        })
      );

      toast.success(`${item.title} added to cart ✅`);

      // close modal after successful add
      onClose();
    } catch (err) {
      console.error("Error checking schedule availability:", err);
      toast.error("Could not verify schedule availability. Try again.");
    }
  };

  const handleBookNow = async () => {
    if (!chosenSchedule) {
      toast.error("Please choose a time first.");
      return;
    }
    if (!participants) {
      toast.error("Please choose number of participants.");
      return;
    }

    // This will verify availability and add to cart, and close modal on success
    await handleAddToCart();

    // If added successfully we navigate to cart.
    // (We assume handleAddToCart closed the modal on success)
    router.push("/cart");
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

      {/* Time bubbles */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Select a Time:</h3>
        <div className="flex flex-wrap gap-2">
          {localSchedules.length > 0 ? (
            localSchedules.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`badge p-3 cursor-pointer ${
                  chosenSchedule?.id === s.id
                    ? "badge-primary text-white"
                    : "badge-outline"
                }`}
                onClick={() => setChosenSchedule(s)}
              >
                {s.date} {s.time ? `• ${s.time}` : ""}
              </button>
            ))
          ) : (
            <div className="text-gray-500">No times available</div>
          )}
        </div>
      </div>

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
            )
          )}
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          className="btn btn-secondary"
          onClick={handleAddToCart}
          aria-disabled={!chosenSchedule}
        >
          Add to Cart
        </button>

        <button
          className="btn btn-primary"
          onClick={handleBookNow}
          aria-disabled={!chosenSchedule}
        >
          Book Now
        </button>
      </div>
    </Modal>
  );
}
