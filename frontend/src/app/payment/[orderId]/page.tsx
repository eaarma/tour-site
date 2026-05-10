"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag, Users } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/common/Modal";
import PaymentMethodSection from "@/components/payment/PaymentMethodSection";
import PaymentSummarySection from "@/components/payment/PaymentSummarySection";
import PaymentTotalSection from "@/components/payment/PaymentTotalSection";
import StripePaymentForm from "@/components/payment/StripePaymentForm";
import { OrderService } from "@/lib/orders/orderService";
import { ReservationService } from "@/lib/orders/reservationService";
import { StripeService } from "@/lib/payments/stripeService";
import { removeItemFromCart } from "@/store/cartSlice";
import { RootState } from "@/store/store";
import { OrderResponseDto } from "@/types";

type TourSnapshot = {
  price?: number;
  type?: string;
};

function parseTourSnapshot(snapshot?: string): TourSnapshot | null {
  if (!snapshot) return null;

  try {
    return JSON.parse(snapshot) as TourSnapshot;
  } catch {
    return null;
  }
}

const formatStatus = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatCountdown = (value: number) =>
  `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, "0")}`;

export default function PaymentPage() {
  const params = useParams();
  const orderIdParam = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;
  const orderId = Number(orderIdParam);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const reservationToken = searchParams.get("token") || "";

  const checkoutInfo = useSelector((state: RootState) => state.checkout);
  const cartItems = useSelector((state: RootState) =>
    state.cart.items.filter((item) => item.selected),
  );

  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [orderLoaded, setOrderLoaded] = useState(false);

  const subtotal = useMemo(() => {
    if (order?.totalPrice != null) {
      const total = Number(order.totalPrice);
      return Number.isFinite(total) ? total : 0;
    }

    return cartItems.reduce((sum, item) => {
      const isPublic = item.type === "PUBLIC";
      return sum + (isPublic ? item.price * item.participants : item.price);
    }, 0);
  }, [order?.totalPrice, cartItems]);

  const summaryItems = useMemo(() => {
    if (order?.items?.length) {
      return order.items.map((item) => {
        const snapshot = parseTourSnapshot(item.tourSnapshot);
        const billingType = snapshot?.type?.toUpperCase() ?? "PUBLIC";
        const lineTotal = Number(item.pricePaid ?? 0);
        const quantity = item.participants ?? 1;
        const unitPrice =
          billingType === "PUBLIC" && quantity > 0
            ? lineTotal / quantity
            : lineTotal;

        return {
          id: String(item.id ?? item.tourId ?? "item"),
          title: item.tourTitle ?? "Tour",
          date: item.scheduledAt ? String(item.scheduledAt).split("T")[0] : "",
          time: item.scheduledAt
            ? (String(item.scheduledAt).split("T")[1]?.slice(0, 5) ?? "")
            : "",
          quantity,
          price: Number.isFinite(unitPrice) ? unitPrice : 0,
          type: billingType,
        };
      });
    }

    return cartItems.map((item) => ({
      id: String(item.cartItemId),
      title: item.title,
      date: item.selectedDate,
      time: item.selectedTime,
      quantity: item.participants,
      price: item.price,
      type: item.type,
    }));
  }, [order?.items, cartItems]);

  const summaryContact = useMemo(() => {
    const firstOrderItem = order?.items?.[0];

    if (firstOrderItem) {
      return {
        name: firstOrderItem.name ?? "",
        email: firstOrderItem.email ?? "",
        phone: firstOrderItem.phone ?? "",
        nationality: firstOrderItem.nationality ?? "",
      };
    }

    return checkoutInfo;
  }, [order?.items, checkoutInfo]);

  const participantCount = useMemo(
    () => summaryItems.reduce((total, item) => total + item.quantity, 0),
    [summaryItems],
  );

  useEffect(() => {
    if (!reservationToken) {
      toast.error("Missing reservation token");
      router.replace("/cart");
    }
  }, [reservationToken, router]);

  useEffect(() => {
    if (!Number.isFinite(orderId)) {
      toast.error("Invalid order id");
      router.replace("/cart");
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        const data = await OrderService.getOrderById(orderId, reservationToken);

        if (cancelled) return;

        setOrder(data);
        setOrderLoaded(true);

        if (data.status === "PAID") {
          router.replace(`/confirmation/${orderId}?token=${reservationToken}`);
          return;
        }

        if (data.status !== "RESERVED" && data.status !== "FINALIZED") {
          toast.error("Order is not payable");
          router.replace("/cart");
          return;
        }

        if (data.expiresAt) {
          const expiryMs = new Date(data.expiresAt).getTime();
          const seconds = Math.floor((expiryMs - Date.now()) / 1000);
          setExpiresIn(Math.max(0, seconds));
        } else {
          setExpiresIn(0);
        }
      } catch {
        if (cancelled) return;
        toast.error("Order not found");
        router.replace("/cart");
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, reservationToken, router]);

  useEffect(() => {
    if (!order?.expiresAt) return;

    const interval = window.setInterval(() => {
      setExpiresIn((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          toast.error("Reservation expired");
          router.replace("/cart");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [order?.expiresAt, router]);

  const handleProceed = async () => {
    if (!orderLoaded) return;

    if (order === null) {
      toast.error("Order not found");
      router.replace("/cart");
      return;
    }

    if (order.status === "PAID") {
      router.replace(`/confirmation/${orderId}?token=${reservationToken}`);
      return;
    }

    setLoading(true);

    try {
      let effectiveOrderId = orderId;

      if (order.status === "RESERVED") {
        const finalized = await ReservationService.finalize(
          orderId,
          reservationToken,
        );
        effectiveOrderId = finalized.id;

        const updatedOrder = await OrderService.getOrderById(
          orderId,
          reservationToken,
        );
        setOrder(updatedOrder);
      }

      const secret = await StripeService.createIntent(
        effectiveOrderId,
        reservationToken,
      );
      setClientSecret(secret);
    } catch {
      toast.error("Failed to start payment");
    } finally {
      setLoading(false);
    }
  };

  const waitForPaymentConfirmation = async (currentOrderId: number) => {
    const maxAttempts = 15;
    const delay = 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const payment = await StripeService.getPaymentStatus(
          currentOrderId,
          reservationToken,
        );

        if (payment.status === "SUCCEEDED") return "SUCCEEDED";
        if (payment.status === "FAILED") return "FAILED";
      } catch {
        // Ignore transient polling errors while waiting for Stripe confirmation.
      }

      await new Promise((resolve) => window.setTimeout(resolve, delay));
    }

    return "TIMEOUT";
  };

  const handleStripeSuccess = async () => {
    setClientSecret(null);
    setLoading(true);
    toast.loading("Finalizing payment...");

    const result = await waitForPaymentConfirmation(orderId);

    toast.dismiss();
    setLoading(false);

    if (result === "FAILED") {
      toast.error("Payment failed.");
      return;
    }

    if (result === "TIMEOUT") {
      toast.error(
        "Payment received, but confirmation is delayed. Please refresh your orders.",
      );
      return;
    }

    cartItems.forEach((item) => {
      dispatch(removeItemFromCart(item.cartItemId));
    });

    toast.success("Payment successful.");
    router.push(`/confirmation/${orderId}?token=${reservationToken}`);
  };

  const handleStripeError = (message: string) => {
    toast.error(message);
  };

  const paymentActionLabel =
    order?.status === "PAID"
      ? "Payment completed"
      : "Continue to Secure Payment";
  const paymentDisabled =
    loading || !orderLoaded || order === null || order.status === "PAID";
  const showCountdown = Boolean(order?.expiresAt) && order?.status !== "PAID";

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-[28px] border border-base-300 bg-base-100 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="border-b border-base-300 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                  Payment
                </p>
                <h1 className="mt-3 text-3xl font-bold text-base-content">
                  Review and Pay
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/65">
                  Review the booking details, confirm the secure payment method,
                  and complete the reservation before the hold expires.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {order && (
                  <span className="badge badge-outline border-base-300 bg-base-100/80 px-4 py-3 text-base-content">
                    {formatStatus(order.status)}
                  </span>
                )}
                <span className="badge badge-outline border-base-300 bg-base-100/80 px-4 py-3 text-base-content">
                  Order #{orderId}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="space-y-6">
              <PaymentSummarySection
                items={summaryItems}
                contact={summaryContact}
              />

              <PaymentMethodSection selected="stripe" onSelect={() => {}} />
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
                Tours
              </p>
              <p className="mt-2 text-2xl font-semibold text-base-content">
                {summaryItems.length}
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
                Participants
              </p>
              <p className="mt-2 text-2xl font-semibold text-base-content">
                {participantCount}
              </p>
            </div>
          </div>

          <PaymentTotalSection
            subtotal={subtotal}
            onProceed={handleProceed}
            isLoading={loading}
            disabled={paymentDisabled}
            actionLabel={paymentActionLabel}
          />

          {showCountdown && (
            <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/55">
                Payment Window
              </p>
              <p className="mt-2 text-2xl font-bold text-base-content">
                {formatCountdown(expiresIn)}
              </p>
              <p className="mt-1 text-sm text-base-content/65">
                Time remaining to complete payment.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-primary/15 bg-base-100 p-4 text-sm leading-6 text-base-content/70 shadow-sm">
            Stripe securely handles your card details and confirms the payment
            before we send you to the booking confirmation page.
          </div>
        </aside>
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-fade-in rounded-2xl bg-base-100 p-6 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-lg font-medium text-base-content">
                Processing...
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

