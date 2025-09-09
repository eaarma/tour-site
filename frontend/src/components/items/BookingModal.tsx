"use client";

import Modal from "../common/Modal";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Item } from "@/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
}

export default function BookingModal({
  isOpen,
  onClose,
  item,
}: BookingModalProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [participants, setParticipants] = useState(1);
  const [message, setMessage] = useState("");

  const maxParticipants = Number(item.participants) || 20;

  const handleAddToCart = () => {
    if (!selectedDate || !selectedTime) {
      setMessage("⚠️ Please select a date and time first");
      return;
    }

    dispatch(
      addItemToCart({
        id: item.id.toString(),
        title: item.title,
        price: Number(item.price),
        participants,
        selectedDate,
        selectedTime,
      })
    );

    setMessage(`${item.title} added to cart ✅`);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleBookNow = () => {
    handleAddToCart();
    if (selectedDate && selectedTime) {
      onClose();
      router.push("/cart");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
      <p className="mb-4">Price: {item.price} €</p>

      {/* Message */}
      {message && <div className="alert alert-info mb-4">{message}</div>}

      {/* Date selection */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Select Date</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">-- Choose a date --</option>
          <option value="2025-09-15">Sept 15, 2025</option>
          <option value="2025-09-22">Sept 22, 2025</option>
        </select>
      </div>

      {/* Time selection */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Select Time</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">-- Choose a time --</option>
          <option value="10:00">10:00 AM</option>
          <option value="14:00">2:00 PM</option>
        </select>
      </div>

      {/* Participants selection */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Participants</label>
        <select
          value={participants}
          onChange={(e) => setParticipants(Number(e.target.value))}
          className="select select-bordered w-full"
        >
          {Array.from({ length: maxParticipants }, (_, i) => i + 1).map(
            (num) => (
              <option key={num} value={num}>
                {num}
              </option>
            )
          )}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <button className="btn btn-secondary" onClick={handleAddToCart}>
          Add to Cart
        </button>

        <button className="btn btn-primary" onClick={handleBookNow}>
          Book Now
        </button>
      </div>
    </Modal>
  );
}
