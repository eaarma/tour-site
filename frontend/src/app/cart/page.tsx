"use client";

import CartItemSection from "@/components/cart/CartItemSection";
import CartTotalSection from "@/components/cart/CartTotalSection";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { removeItemFromCart } from "@/store/cartSlice";

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleRemove = (id: string) => {
    dispatch(removeItemFromCart(id));
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const totalPrice = cart.reduce(
    (acc, entry) => acc + entry.price * entry.participants,
    0
  );

  return (
    <main className="max-w-7xl mx-auto p-4 min-h-screen mt-5">
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty 🛒</p>
      ) : (
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <CartItemSection cart={cart} onRemove={handleRemove} />
          <CartTotalSection
            totalPrice={totalPrice}
            onCheckout={handleCheckout}
          />
        </div>
      )}
    </main>
  );
}
