"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import PaymentMethodSection from "@/components/payment/PaymentMethodSection";
import PaymentSummarySection from "@/components/payment/PaymentSummarySection";
import PaymentTotalSection from "@/components/payment/PaymentTotalSection";
import StripePaymentForm from "@/components/payment/StripePaymentForm";
import Modal from "@/components/common/Modal";

import { RootState } from "@/store/store";
import { removeItemFromCart } from "@/store/cartSlice";

import { StripeService } from "@/lib/stripeService";
import { OrderService } from "@/lib/orderService";
import { OrderResponseDto } from "@/types";
import { ReservationService } from "@/lib/reservationService";

export default function PaymentPage() {
  const params = useParams();
  const orderId = Number(params.orderId);
  const router = useRouter();
  const dispatch = useDispatch();

  // Keep UI consistent with your existing components
  const checkoutInfo = useSelector((state: RootState) => state.checkout);

  // We keep cart selected items only for (a) UI summary fallback and (b) cart clearing on success.
  // The *source of truth* for the reservation is the order fetched from backend.
  const cartItems = useSelector((state: RootState) =>
    state.cart.items.filter((i) => i.selected),
  );

  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [expiresIn, setExpiresIn] = useState<number>(0);

  const [order, setOrder] = useState<OrderResponseDto | null>(null); // use your OrderDto type if you have it
  const [orderLoaded, setOrderLoaded] = useState(false);

  const searchParams = useSearchParams();
  const reservationToken = searchParams.get("token") || "";

  // -------- Helpers --------

  const subtotal = useMemo(() => {
    // Prefer backend order total once loaded. Fall back to cart subtotal.
    if (order?.totalPrice != null) {
      const n = Number(order.totalPrice);
      return Number.isFinite(n) ? n : 0;
    }
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.participants,
      0,
    );
  }, [order, cartItems]);

  const summaryItems = useMemo(() => {
    // Prefer backend order items if available; else fall back to cart items
    /*  if (order?.items?.length) {
      return order.items.map((it: OrderItemResponseDto) => ({
        id: it.id ?? it.tourId ?? "item",
        title: it.tourTitle ?? "Tour",
        date: it.scheduledAt ? String(it.scheduledAt).split("T")[0] : "",
        time: it.scheduledAt
          ? String(it.scheduledAt).split("T")[1]?.slice(0, 5)
          : "",
        quantity: it.participants ?? 1,
        price: Number(it.pricePaid ?? 0),
      }));
    } */

    return cartItems.map((item) => ({
      id: item.id,
      title: item.title,
      date: item.selectedDate,
      time: item.selectedTime,
      quantity: item.participants,
      price: item.price,
    }));
  }, [order, cartItems]);

  useEffect(() => {
    if (!reservationToken) {
      toast.error("Missing reservation token");
      router.replace("/cart");
      return;
    }
  }, []);
  // -------- Load order on mount / refresh --------

  useEffect(() => {
    if (!Number.isFinite(orderId)) {
      toast.error("Invalid order id");
      router.replace("/cart");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await OrderService.getOrderById(orderId);

        console.log("Order status:", data.status);

        if (cancelled) return;

        setOrder(data);
        setOrderLoaded(true);

        // ✅ Redirect logic
        if (data.status === "PAID") {
          router.replace(`/confirmation/${orderId}`);
          return;
        }

        // If you have FAILED / EXPIRED statuses, handle them here
        if (data.status !== "RESERVED" && data.status !== "FINALIZED") {
          toast.error("Order is not payable");
          router.replace("/cart");
          return;
        }

        // ✅ countdown from expiresAt (backend source of truth)
        if (data.expiresAt) {
          const expiryMs = new Date(data.expiresAt).getTime();
          const seconds = Math.floor((expiryMs - Date.now()) / 1000);
          setExpiresIn(Math.max(0, seconds));
        } else {
          // If backend doesn't send expiresAt, don’t crash; just hide countdown.
          setExpiresIn(0);
        }
      } catch {
        if (cancelled) return;
        toast.error("Order not found");
        router.replace("/cart");
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  // -------- Countdown timer --------

  useEffect(() => {
    if (!order?.expiresAt) return;

    const interval = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("Reservation expired");
          router.replace("/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.expiresAt, router]);

  // -------- Payment --------

  const handleProceed = async () => {
    if (!orderLoaded) return;

    if (order === null) {
      toast.error("Order not found");
      router.replace("/cart");
      return;
    }

    if (order.status === "PAID") {
      router.replace(`/confirmation/${orderId}`);
      return;
    }

    setLoading(true);

    try {
      let effectiveOrderId = orderId;

      // 🔹 If still RESERVED → finalize first
      if (order.status === "RESERVED") {
        const finalized = await ReservationService.finalize(
          orderId,
          reservationToken,
        );
        effectiveOrderId = finalized.id;

        // reload order state
        const updated = await OrderService.getOrderById(orderId);
        setOrder(updated);
      }

      // 🔹 Now Payment exists
      const secret = await StripeService.createIntent(effectiveOrderId);
      setClientSecret(secret);
    } catch {
      toast.error("Failed to start payment");
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = async () => {
    setClientSecret(null);
    setLoading(true);
    toast.loading("Finalizing payment…");

    const result = await waitForPaymentConfirmation(orderId);

    toast.dismiss();
    setLoading(false);

    if (result === "FAILED") {
      toast.error("Payment failed ❌");
      return;
    }

    if (result === "TIMEOUT") {
      toast.error(
        "Payment received but confirmation is delayed. Please refresh your orders.",
      );
      return;
    }

    // Clear selected cart items (best-effort)
    cartItems.forEach((item) => {
      dispatch(removeItemFromCart(item.cartItemId));
    });

    toast.success("Payment successful ✅");
    router.push(`/confirmation/${orderId}`);
  };

  const handleStripeError = (msg: string) => {
    toast.error(msg);
  };

  const waitForPaymentConfirmation = async (orderId: number) => {
    const maxAttempts = 15;
    const delay = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const payment = await StripeService.getPaymentStatus(orderId);

        if (payment.status === "SUCCEEDED") return "SUCCEEDED";
        if (payment.status === "FAILED") return "FAILED";
      } catch {
        // ignore transient errors
      }

      await new Promise((r) => setTimeout(r, delay));
    }

    return "TIMEOUT";
  };

  // -------- Render --------

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <PaymentSummarySection items={summaryItems} contact={checkoutInfo} />
          <PaymentMethodSection selected={"stripe"} onSelect={() => {}} />
        </div>

        {/* Right Column */}
        <div className="w-full md:w-[320px] md:self-start space-y-3">
          <PaymentTotalSection
            subtotal={subtotal}
            onProceed={handleProceed}
            isLoading={loading}
          />

          {!!order?.expiresAt && (
            <div className="bg-warning/20 p-4 rounded-lg text-center font-semibold">
              Reservation expires in {Math.floor(expiresIn / 60)}:
              {(expiresIn % 60).toString().padStart(2, "0")}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!clientSecret}
        onClose={() => setClientSecret(null)}
        dismissable={false}
      >
        {clientSecret && (
          <StripePaymentForm
            amount={subtotal}
            clientSecret={clientSecret}
            onSuccess={handleStripeSuccess}
            onError={handleStripeError}
          />
        )}
      </Modal>

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
