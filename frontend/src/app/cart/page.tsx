"use client";

import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

import CartItemSection from "@/components/cart/CartItemSection";
import CartTotalSection from "@/components/cart/CartTotalSection";
import ItemModal from "@/components/items/ItemModal";
import type { CartItem as CartItemType } from "@/types/cart";
import { RootState } from "@/store/store";

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const [viewItem, setViewItem] = useState<CartItemType | null>(null);

  const handleView = useCallback((cartItem: CartItemType) => {
    setViewItem(cartItem);
  }, []);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[28px] border border-base-300 bg-base-100 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="border-b border-base-300 px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
              Cart
            </p>
            <h1 className="mt-3 text-3xl font-bold text-base-content">
              Review Your Booking
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/60">
              Check your selected tours, review the schedule details, and
              continue when everything looks right.
            </p>
          </div>

          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <CartItemSection cart={cart} onView={handleView} />
            <CartTotalSection />
          </div>
        </div>
      </div>

      {viewItem ? (
        <ItemModal
          isOpen
          onClose={() => setViewItem(null)}
          item={{
            id: Number(viewItem.id),
            title: viewItem.title,
            price: viewItem.price,
            participants: viewItem.participants,
            images: viewItem.images,
            type: viewItem.type,
            status: "ACTIVE",
            timeRequired: 60,
            language: viewItem.availableLanguages ?? [],
          }}
          cartItemId={viewItem.cartItemId}
          initialScheduleId={viewItem.scheduleId}
          initialParticipants={viewItem.participants}
          initialPreferredLanguage={viewItem.preferredLanguage}
          initialComment={viewItem.comment}
        />
      ) : null}
    </main>
  );
}
