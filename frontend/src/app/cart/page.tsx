"use client";

import { useState } from "react";
import CartItemSection from "../../components/cart/CartItemSection";
import CartTotalSection from "../../components/cart/CartTotalSection";
import { Item } from "@/types/types";
import { useRouter } from "next/navigation";

const MOCK_CART: { item: Item; quantity: number }[] = [
  {
    item: {
      id: "1",
      title: "Athens Walking Tour",
      description: "Historical sites and local culture",
      image: "/images/athens.jpg",
      price: "40",
      timeRequired: "2 hours",
      intensity: "Low",
      participants: "Max 10",
      category: "Culture",
      language: "English",
      type: "Tour",
      location: "Athens",
    },
    quantity: 2,
  },
  {
    item: {
      id: "3",
      title: "Meteora Hiking Adventure",
      description: "Breathtaking views and active trekking",
      image: "/images/meteora.jpg",
      price: "75",
      timeRequired: "5 hours",
      intensity: "High",
      participants: "Max 6",
      category: "Adventure",
      language: "English",
      type: "Tour",
      location: "Kalambaka",
    },
    quantity: 1,
  },
];

export default function CartPage() {
  const [cart, setCart] = useState(MOCK_CART);
  const router = useRouter();

  const handleRemove = (id: string) => {
    setCart((prev) => prev.filter((entry) => entry.item.id !== id));
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout...");
    router.push("/checkout");
  };

  const totalPrice = cart.reduce(
    (acc, entry) => acc + parseFloat(entry.item.price) * entry.quantity,
    0
  );

  return (
    <main className="max-w-7xl mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>

      {/* This flex container will stack on mobile and show side-by-side on md+ */}
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* CartItemSection will take 2/3 width on md+ screens */}
        <CartItemSection cart={cart} onRemove={handleRemove} />

        {/* CartTotalSection will take 1/3 width on md+ screens */}
        <CartTotalSection totalPrice={totalPrice} onCheckout={handleCheckout} />
      </div>
    </main>
  );
}
