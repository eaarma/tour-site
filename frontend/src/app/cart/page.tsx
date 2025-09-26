"use client";

import CartItemSection from "@/components/cart/CartItemSection";
import CartTotalSection from "@/components/cart/CartTotalSection";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useCallback, useState } from "react";
import ItemModal from "@/components/items/ItemModal"; // import the new modal
import { CartItem as CartItemType } from "@/store/cartSlice";
import { Item } from "@/types";

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const router = useRouter();

  const [viewItem, setViewItem] = useState<CartItemType | null>(null);

  const handleView = useCallback((cartItem: Item) => {
    setViewItem(cartItem);
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-4 min-h-screen mt-5">
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty 🛒</p>
      ) : (
        <div className="flex flex-col md:flex-row md:items-start gap-6">
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
            description: viewItem.description || "",
            price: viewItem.price,
            participants: viewItem.participants,
            image: viewItem.image,
            location: viewItem.location,
            language: viewItem.language,
            intensity: viewItem.intensity,
            category: viewItem.category,
            status: "ACTIVE",
            timeRequired: 60, // 🔹 adjust if you store real value
          }}
          cartItemId={viewItem.id}
          initialScheduleId={viewItem.scheduleId}
        />
      )}
    </main>
  );
}
