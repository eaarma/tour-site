"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Globe2,
  MapPin,
  Mail,
  Phone,
  ReceiptText,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { OrderService } from "@/lib/orders/orderService";
import { OrderResponseDto } from "@/types/order";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const formatStatus = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatPaymentMethod = (value?: string | null) => {
  if (!value) return "Not specified";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatText = (value?: string | null, fallback = "Not provided") =>
  value?.trim() || fallback;

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;

  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadOrder = async () => {
      try {
        const data = await OrderService.getById(id, token);

        if (cancelled) return;

        setOrder(data);
      } catch {
        if (cancelled) return;

        toast.error("Unable to load order");
        router.push("/");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [id, token, router]);

  const mainItem = order?.items?.[0] ?? null;
  const isPaid = order?.status === "PAID";

  const participantCount = useMemo(
    () =>
      order?.items?.reduce((total, item) => total + item.participants, 0) ?? 0,
    [order?.items],
  );

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
            <span className="loading loading-spinner loading-lg text-success" />
            <p className="mt-5 text-lg font-semibold text-base-content">
              Loading confirmation
            </p>
            <p className="mt-2 text-sm text-base-content/60">
              We&apos;re preparing your booking summary.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
            <p className="text-lg font-semibold text-base-content">
              Order not found
            </p>
            <p className="mt-2 text-sm text-base-content/60">
              Returning you to the homepage.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(34,197,94,0.10)_0%,rgba(255,255,255,0)_24%)] px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-[28px] border border-base-300 bg-base-100 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="border-b border-base-300 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full bg-success/10 px-4 py-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                    Confirmation
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-bold text-base-content">
                  {isPaid ? "Booking Confirmed" : "Reservation Received"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/65">
                  {isPaid
                    ? "Your payment went through successfully and your selected tours are now confirmed."
                    : "Your order is saved here and ready for the next payment or booking step."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`badge px-4 py-3 font-medium ${
                    isPaid
                      ? "border-success/20 bg-success/10 text-success"
                      : "badge-outline border-base-300 bg-base-100/80 text-base-content"
                  }`}
                >
                  {formatStatus(order.status)}
                </span>
                <span className="badge badge-outline border-base-300 bg-base-100/80 px-4 py-3 text-base-content">
                  Order #{order.id}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="space-y-8">
              <section className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-sm font-semibold text-success-content">
                    1
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      Booking Overview
                    </h2>
                    <p className="text-sm text-base-content/60">
                      A quick summary of the order, traveler, and payment
                      details.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-success/20 bg-success/5 p-5 text-sm leading-6 text-base-content/75">
                  {isPaid
                    ? "Thank you for booking with us. A confirmation has been created for this order and we’ll use the provided details for follow-up and tour communication."
                    : "This order has been saved, but it does not show as fully paid yet. You can still review all booking details below."}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/65">
                      Traveler
                    </p>
                    <p className="mt-3 text-lg font-semibold text-base-content">
                      {formatText(mainItem?.name)}
                    </p>

                    <div className="mt-4 space-y-3 text-sm text-base-content/70">
                      {isAuthenticated && (
                        <div className="flex items-start gap-2">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{formatText(mainItem?.email)}</span>
                        </div>
                      )}

                      {isAuthenticated && (
                        <div className="flex items-start gap-2">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{formatText(mainItem?.phone)}</span>
                        </div>
                      )}

                      {mainItem?.nationality && (
                        <div className="flex items-start gap-2">
                          <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{mainItem.nationality}</span>
                        </div>
                      )}

                      {!isAuthenticated && (
                        <p className="rounded-xl bg-base-200/50 px-3 py-2 text-xs leading-5 text-base-content/60">
                          Additional contact details are tied to the booking and
                          will be used for reservation updates.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary/70">
                      Payment Summary
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                          <span>Method</span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-base-content">
                          {formatPaymentMethod(order.paymentMethod)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
                          <ReceiptText className="h-3.5 w-3.5 text-primary" />
                          <span>Status</span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-base-content">
                          {formatStatus(order.status)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-base-300 bg-base-200/35 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50">
                        Total Paid
                      </p>
                      <p className="mt-2 text-3xl font-bold text-base-content">
                        {formatPrice(order.totalPrice)}
                      </p>
                      <p className="mt-2 text-sm text-base-content/60">
                        Created on {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">
                    2
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      Booked Experiences
                    </h2>
                    <p className="text-sm text-base-content/60">
                      These are the tours included in this order.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-base-content">
                              {item.tourTitle}
                            </p>
                            <span className="badge badge-outline border-base-300 bg-base-100 text-base-content/75">
                              {formatStatus(item.status)}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 text-sm text-base-content/70">
                            <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                              <CalendarDays className="h-3.5 w-3.5 text-primary" />
                              <span>{formatDateTime(item.scheduledAt)}</span>
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                              <Users className="h-3.5 w-3.5 text-primary" />
                              <span>
                                {item.participants} participant
                                {item.participants === 1 ? "" : "s"}
                              </span>
                            </span>

                            {item.tourMeetingPoint && (
                              <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span>{item.tourMeetingPoint}</span>
                              </span>
                            )}
                          </div>

                          {(item.preferredLanguage || item.comment) && (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {item.preferredLanguage && (
                                <div className="rounded-xl border border-base-300 bg-base-200/35 px-4 py-3 text-sm text-base-content/70">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
                                    Preferred Language
                                  </p>
                                  <p className="mt-2 font-medium text-base-content">
                                    {item.preferredLanguage}
                                  </p>
                                </div>
                              )}

                              {item.comment && (
                                <div className="rounded-xl border border-base-300 bg-base-200/35 px-4 py-3 text-sm text-base-content/70">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
                                    Note
                                  </p>
                                  <p className="mt-2 font-medium text-base-content">
                                    {item.comment}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 rounded-2xl border border-base-300 bg-base-200/35 px-4 py-3 text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50">
                            Paid
                          </p>
                          <p className="mt-1 text-xl font-bold text-base-content">
                            {formatPrice(item.pricePaid)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="inline-flex rounded-xl bg-success/10 p-2 text-success">
                <ReceiptText className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
                Tours
              </p>
              <p className="mt-2 text-2xl font-semibold text-base-content">
                {order.items.length}
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="inline-flex rounded-xl bg-success/10 p-2 text-success">
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

          <section className="rounded-[24px] border border-base-300 bg-base-100 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-success/80">
              Paid
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-base-content">
              Booking Total
            </h2>

            <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/35 p-5">
              <div className="flex items-center justify-between text-sm text-base-content/70">
                <span>Payment method</span>
                <span>{formatPaymentMethod(order.paymentMethod)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-base-content/70">
                <span>Order status</span>
                <span>{formatStatus(order.status)}</span>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-base-300 pt-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50">
                    Total
                  </p>
                  <p className="mt-1 text-3xl font-bold text-base-content">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-success/20 bg-success/5 p-4 text-sm leading-6 text-base-content/70">
              Your booking is saved under order #{order.id}. Use the same email
              and phone details for any follow-up questions about these tours.
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn btn-primary mt-6 h-12 w-full text-base"
            >
              Back to Home
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}

