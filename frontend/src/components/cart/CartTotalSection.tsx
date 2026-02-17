"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";
import { CartItem } from "@/types";
import { validateSchedulesAgainstCapacity } from "@/lib/validateSchedulesAgainstCapacity";

interface Props {
  // optional callback after successful validation/checkout
  onCheckoutSuccess?: (selectedItems: CartItem[]) => void;
}

const CartTotalSection: React.FC<Props> = ({ onCheckoutSuccess }) => {
  const cart = useSelector((state: RootState) => state.cart.items);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const selectedItems = cart.filter((i) => i.selected);

  const totalPrice = selectedItems.reduce(
    (acc, entry) => acc + entry.price * entry.participants,
    0,
  );

  const handleProceedToCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to proceed.");
      return;
    }

    setLoading(true);
    const { ok, issues } =
      await validateSchedulesAgainstCapacity(selectedItems);

    setLoading(false);

    if (!ok) {
      const first = issues[0];
      const firstItem = first.items[0];

      if (first.available <= 0) {
        toast.error(
          `"${firstItem.title}" is fully booked for ${firstItem.selectedDate} ${firstItem.selectedTime}.`,
        );
      } else {
        toast.error(
          `Only ${first.available} spots available for "${firstItem.title}" (${firstItem.selectedDate} ${firstItem.selectedTime}).`,
        );
      }

      return;
    }

    // all good -> either call provided callback or navigate to checkout page
    if (onCheckoutSuccess) {
      onCheckoutSuccess(selectedItems);
    } else {
      // store selected items somewhere or rely on cart state during checkout
      router.push("/checkout");
    }
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/3 p-4 border rounded-xl shadow-sm bg-base-100 space-y-4 sm:mt-25 md:mt-25">
      <h3 className="text-xl font-semibold mb-4">Summary</h3>
      <div className="flex justify-between">
        <span>Items</span>
        <span>{selectedItems.length}</span>
      </div>
      <div className="flex justify-between mt-2">
        <span>Total</span>
        <span className="font-bold">€{totalPrice.toFixed(2)}</span>
      </div>
      <button
        className={`btn btn-primary w-full mt-6 ${loading ? "loading" : ""}`}
        onClick={handleProceedToCheckout}
        disabled={loading}
      >
        Proceed to checkout
      </button>
    </div>
  );
};

export default CartTotalSection;
