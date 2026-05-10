"use client";

import { CalendarDays, Globe2, Mail, Phone, Users } from "lucide-react";

type CheckoutItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  quantity: number;
  price: number;
  type: string;
};

type ContactInfo = {
  name: string;
  email: string;
  phone: string;
  nationality?: string;
};

type PaymentSummarySectionProps = {
  items: CheckoutItem[];
  contact: ContactInfo;
  currency?: string;
};

const formatPrice = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);

const formatDateTime = (date: string, time: string) => {
  if (date && time) return `${date} at ${time}`;
  return date || time || "Schedule to be confirmed";
};

const formatContactValue = (value?: string) => value?.trim() || "Not provided";

export default function PaymentSummarySection({
  items,
  contact,
  currency = "EUR",
}: PaymentSummarySectionProps) {
  const participantCount = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <section className="p-4 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
        Reservation
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-base-content">
        Order Summary
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/60">
        Review the selected tours and the contact details attached to this
        booking.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
            Tours
          </p>
          <p className="mt-2 text-2xl font-semibold text-base-content">
            {items.length}
          </p>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
            Participants
          </p>
          <p className="mt-2 text-2xl font-semibold text-base-content">
            {participantCount}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-base-300 bg-base-200/25 p-5 text-sm leading-6 text-base-content/60">
          No items are available for this payment yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const lineTotal =
              item.type === "PUBLIC" ? item.price * item.quantity : item.price;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-base-300 bg-base-100 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-base-content">
                      {item.title}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-base-content/70">
                      <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        <span>{formatDateTime(item.date, item.time)}</span>
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>
                          {item.quantity} participant
                          {item.quantity === 1 ? "" : "s"}
                        </span>
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-base-content/60">
                      {item.type === "PUBLIC"
                        ? `${formatPrice(item.price, currency)} per participant`
                        : "Private tour rate for the full booking"}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-base-300 bg-base-200/35 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50">
                      Line Total
                    </p>
                    <p className="mt-1 text-lg font-semibold text-base-content">
                      {formatPrice(lineTotal, currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/35 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary/70">
          Contact Details
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Name</span>
            </div>
            <p className="mt-2 text-sm font-medium leading-6 text-base-content">
              {formatContactValue(contact.name)}
            </p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>Email</span>
            </div>
            <p className="mt-2 text-sm font-medium leading-6 text-base-content">
              {formatContactValue(contact.email)}
            </p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>Phone</span>
            </div>
            <p className="mt-2 text-sm font-medium leading-6 text-base-content">
              {formatContactValue(contact.phone)}
            </p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              <span>Nationality</span>
            </div>
            <p className="mt-2 text-sm font-medium leading-6 text-base-content">
              {formatContactValue(contact.nationality)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
