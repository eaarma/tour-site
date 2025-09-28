"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import PaymentMethodSection from "@/components/payment/PaymentMethodSection";
import PaymentSummarySection from "@/components/payment/PaymentSummarySection";
import PaymentTotalSection from "@/components/payment/PaymentTotalSection";
import { RootState } from "@/store/store";
import { OrderService } from "@/lib/orderService";
import { useRouter } from "next/navigation";
import { OrderCreateRequestDto } from "@/types/order";

export default function PaymentPage() {
  const cartItems = useSelector((state: RootState) =>
    state.cart.items.filter((i) => i.selected)
  );
  const checkoutInfo = useSelector((state: RootState) => state.checkout);
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<
    "credit-card" | "pay-link"
  >("credit-card");
  const [loading, setLoading] = useState(false);

  // Map cart items to summary
  const summaryItems = cartItems.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.selectedDate,
    time: item.selectedTime,
    quantity: item.participants,
    price: item.price,
  }));

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.participants,
    0
  );

  const handleProceed = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setLoading(true);

    try {
      // ✅ Build order request
      const orderRequest: OrderCreateRequestDto = {
        paymentMethod: selectedMethod === "credit-card" ? "CARD" : "PAY_LINK",
        name: checkoutInfo.name,
        email: checkoutInfo.email,
        phone: checkoutInfo.phone,
        nationality: checkoutInfo.nationality,
        items: cartItems.map((item) => ({
          tourId: Number(item.id),
          participants: item.participants,
          scheduledAt: `${item.selectedDate}T${item.selectedTime}`, // ISO
        })),
      };

      const order = await OrderService.create(orderRequest);

      toast.success("Order confirmed ✅");
      router.push(`/confirmation/${order.id}`);
    } catch (err) {
      console.error("Failed to create order", err);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <PaymentSummarySection items={summaryItems} contact={checkoutInfo} />
          <PaymentMethodSection
            selected={selectedMethod}
            onSelect={setSelectedMethod}
          />
        </div>

        {/* Right Column */}
        <div className="flex justify-center md:block md:w-[320px] md:self-start">
          <PaymentTotalSection
            subtotal={subtotal}
            onProceed={handleProceed}
            isLoading={loading}
          />
        </div>
      </div>
    </main>
  );
}
