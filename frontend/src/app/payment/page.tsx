"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import PaymentMethodSection from "@/components/payment/PaymentMethodSection";
import PaymentSummarySection from "@/components/payment/PaymentSummarySection";
import PaymentTotalSection from "@/components/payment/PaymentTotalSection";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { OrderCreateRequestDto } from "@/types/order";
import { CartItem as CartItemType } from "@/types/cart";
import ItemModal from "@/components/items/ItemModal";
import { ReservationService } from "@/lib/reservationService";
import { ReservationResponseDto } from "@/types/order";
import { removeItemFromCart } from "@/store/cartSlice";

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
  const [reservation, setReservation] = useState<ReservationResponseDto | null>(
    null,
  );

  const [expiresIn, setExpiresIn] = useState<number>(0);
  const dispatch = useDispatch();

  const reservedRef = useRef(false);

  useEffect(() => {
    if (reservedRef.current) return;
    reservedRef.current = true;
    const reserve = async () => {
      if (cartItems.length === 0) return;

      const request: OrderCreateRequestDto = {
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

      try {
        const res = await ReservationService.reserve(request);

        setReservation(res);

        const expiry = new Date(res.expiresAt).getTime();
        setExpiresIn(Math.floor((expiry - Date.now()) / 1000));
      } catch {
        toast.error("Failed to reserve order");
      }
    };

    reserve();
  }, []);

  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("Reservation expired");
          router.push("/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

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

  const handleProceed = async () => {
    if (cartItems.length === 0) {
      toast.error("No items chosen for checkout");
      return;
    }
    if (!reservation) return;

    setLoading(true);

    try {
      const order = await ReservationService.finalize(
        reservation.orderId,
        reservation.reservationToken,
      );

      // ✅ Remove purchased cart items
      cartItems.forEach((item) => {
        dispatch(removeItemFromCart(item.cartItemId));
      });

      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order }),
      });

      toast.success("Order confirmed ✅");

      router.push(`/confirmation/${order.id}`);
    } catch {
      toast.error("Payment failed or reservation expired");
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
          {reservation && (
            <div className="bg-warning/20 p-4 rounded-lg text-center font-semibold mt-2">
              Reservation expires in {Math.floor(expiresIn / 60)}:
              {(expiresIn % 60).toString().padStart(2, "0")}
            </div>
          )}
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
