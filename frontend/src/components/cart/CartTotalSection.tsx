"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const selectedItems = cart.filter((i) => i.selected);

  const totalPrice = selectedItems.reduce(
    (acc, entry) => acc + entry.price * entry.participants,
    0
  );

  const handleProceedToCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to proceed.");
      return;
    }

    setLoading(true);
    const { ok, badItems } = await validateSchedulesAgainstCapacity(
      selectedItems
    );
    setLoading(false);

    if (!ok) {
      // show message for first bad item and list count
      const first = badItems[0];
      toast.error(
        `Time ${first.selectedDate} ${first.selectedTime} for "${first.title}" is no longer available. Please pick a different time.`
      );
      // optionally, you can remove bad items from cart:
      // badItems.forEach(i => dispatch(removeItemFromCart(i.id)));
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
    <div className="w-full md:w-1/3 lg:w-1/3 p-4 border rounded-xl shadow-sm bg-base-100 space-y-4 mt-25 md:mt-25 sm:mt-0">
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
