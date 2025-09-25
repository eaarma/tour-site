"use client";

import CartItemSection from "@/components/cart/CartItemSection";
import CartTotalSection from "@/components/cart/CartTotalSection";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useCallback } from "react";

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const router = useRouter();

  const handleView = useCallback((item) => {
    // placeholder — open modal later
    console.log("view item", item);
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
    </main>
  );
}
