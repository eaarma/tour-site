"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { validateSchedulesAgainstCapacity } from "@/lib/tours/validateSchedulesAgainstCapacity";
import type { CartItem } from "@/types";
import { RootState } from "@/store/store";

interface Props {
  onCheckoutSuccess?: (selectedItems: CartItem[]) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

const formatPrice = (price: number) => currencyFormatter.format(price);

export default function CartTotalSection({ onCheckoutSuccess }: Props) {
  const cart = useSelector((state: RootState) => state.cart.items);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const selectedItems = cart.filter((item) => item.selected);
  const selectedLineCount = selectedItems.length;
  const participantCount = selectedItems.reduce(
    (total, item) => total + item.participants,
    0,
  );
  const subtotal = selectedItems.reduce((total, entry) => {
    const isPublic = entry.type === "PUBLIC";
    return total + (isPublic ? entry.price * entry.participants : entry.price);
  }, 0);

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

    if (onCheckoutSuccess) {
      onCheckoutSuccess(selectedItems);
    } else {
      router.push("/checkout");
    }
  };

  return (
    <aside className="h-fit lg:sticky lg:top-8">
      <section className="space-y-6 rounded-[24px] border border-base-300 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-content">
            2
          </span>
          <div>
            <h2 className="text-lg font-semibold text-base-content">
              Checkout Summary
            </h2>
            <p className="text-sm text-base-content/60">
              Only selected items will continue to checkout.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
              Selected
            </p>
            <p className="mt-2 text-2xl font-semibold text-base-content">
              {selectedLineCount}
            </p>
            <p className="mt-1 text-sm text-base-content/60">line items</p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
              Participants
            </p>
            <p className="mt-2 text-2xl font-semibold text-base-content">
              {participantCount}
            </p>
            <p className="mt-1 text-sm text-base-content/60">people total</p>
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <div className="space-y-3 text-sm text-base-content/70">
            <div className="flex justify-between">
              <span>Selected tours</span>
              <span>{selectedLineCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Participants</span>
              <span>{participantCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-base-300 pt-3 text-lg font-semibold text-base-content">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="btn btn-primary h-12 w-full text-base"
            disabled={selectedLineCount === 0 || loading}
            onClick={handleProceedToCheckout}
          >
            {loading ? "Checking cart..." : "Continue to Checkout"}
          </button>

          <button
            type="button"
            className="btn btn-outline h-12 w-full text-base"
            onClick={() => router.push("/items")}
          >
            Continue Browsing
          </button>
        </div>

        {selectedLineCount === 0 ? (
          <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm leading-6 text-base-content/75">
            Select at least one cart item before continuing to checkout.
          </div>
        ) : null}
      </section>
    </aside>
  );
}

