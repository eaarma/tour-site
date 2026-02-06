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
import { CartItem as CartItemType } from "@/types/cart";
import { TourScheduleService } from "@/lib/tourScheduleService";
import ItemModal from "@/components/items/ItemModal";
import { useAuth } from "@/hooks/useAuth";

export default function PaymentPage() {
  const cartItems = useSelector((state: RootState) =>
    state.cart.items.filter((i) => i.selected),
  );
  const checkoutInfo = useSelector((state: RootState) => state.checkout);
  const router = useRouter();
  const [badItem, setBadItem] = useState<CartItemType | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<
    "credit-card" | "pay-link"
  >("credit-card");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();

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
    0,
  );

  const validateSchedules = async () => {
    const bad: CartItemType[] = [];
    for (const it of cartItems) {
      try {
        const schedule = await TourScheduleService.getById(it.scheduleId);
        if (!schedule || schedule.status !== "ACTIVE") {
          bad.push(it);
        }
      } catch {
        bad.push(it);
      }
    }
    return { ok: bad.length === 0, badItems: bad };
  };

  const handleProceed = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const isGuest = !isAuthenticated;

    setLoading(true);

    // ✅ Step 1: Revalidate schedules before placing order
    const { ok, badItems } = await validateSchedules();
    if (!ok) {
      const firstBad = badItems[0];
      setBadItem(firstBad);
      toast.error(
        `Time ${firstBad.selectedDate} ${firstBad.selectedTime} for "${firstBad.title}" is no longer available.`,
      );
      setLoading(false);
      return;
    }

    try {
      // ✅ Step 2: Create full order (backend will book schedules internally)
      const orderRequest: OrderCreateRequestDto = {
        paymentMethod: selectedMethod === "credit-card" ? "CARD" : "PAY_LINK",
        name: checkoutInfo.name,
        email: checkoutInfo.email,
        phone: checkoutInfo.phone,
        nationality: checkoutInfo.nationality,
        items: cartItems.map((item) => ({
          tourId: Number(item.id),
          scheduleId: item.scheduleId,
          participants: item.participants,
          scheduledAt: `${item.selectedDate}T${item.selectedTime}`,
          preferredLanguage: item.preferredLanguage,
          comment: item.comment,
        })),
      };

      const order = await OrderService.create(orderRequest, isGuest);

      // ✅ Step 3: Send email confirmation
      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order }),
      });

      toast.success("Order confirmed ✅");

      // ✅ Step 4: Redirect to confirmation page
      router.push(`/confirmation/${order.id}`);
    } catch (err) {
      console.error("Order creation failed", err);
      toast.error("Failed to create order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <PaymentSummarySection items={summaryItems} contact={checkoutInfo} />
          <PaymentMethodSection
            selected={selectedMethod}
            onSelect={setSelectedMethod}
          />
        </div>

        {/* Right Column: total + proceed */}
        <div className="flex justify-center md:block md:w-[320px] md:self-start">
          <PaymentTotalSection
            subtotal={subtotal}
            onProceed={handleProceed}
            isLoading={loading}
          />
        </div>
      </div>

      {/* 🔹 Show ItemModal when badItem is detected */}
      {badItem && (
        <ItemModal
          isOpen={true}
          onClose={() => setBadItem(null)}
          item={{
            id: Number(badItem.id),
            title: badItem.title,
            price: badItem.price,
            participants: badItem.participants,
            images: badItem.images,
            status: "ACTIVE",
            timeRequired: 60,
            language: badItem.availableLanguages ?? [],
          }}
          cartItemId={badItem.cartItemId}
          initialScheduleId={badItem.scheduleId}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-base-100 rounded-lg p-6 shadow-xl flex flex-col items-center gap-4 animate-fade-in">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="font-medium text-lg">Processing…</p>
          </div>
        </div>
      )}
    </div>
  );
}
