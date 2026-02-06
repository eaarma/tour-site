"use client";

import CartItemSection from "@/components/cart/CartItemSection";
import CartTotalSection from "@/components/cart/CartTotalSection";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useCallback, useState } from "react";
import ItemModal from "@/components/items/ItemModal"; // import the new modal
import { CartItem as CartItemType } from "@/types/cart";

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);

  const [viewItem, setViewItem] = useState<CartItemType | null>(null);

  const handleView = useCallback((cartItem: CartItemType) => {
    setViewItem(cartItem);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen mt-5">
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty 🛒</p>
      ) : (
        <div className="flex flex-col md:flex-row md:items-start sm:gap-6 gap-6">
          <CartItemSection cart={cart} onView={handleView} />
          <CartTotalSection />
        </div>
      )}

      {/* 🔹 Render the modal if user clicked "View" */}
      {viewItem && (
        <ItemModal
          isOpen={true}
          onClose={() => setViewItem(null)}
          item={{
            id: Number(viewItem.id),
            title: viewItem.title,
            price: viewItem.price,
            participants: viewItem.participants,
            images: viewItem.images,
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
      )}
    </div>
  );
}
