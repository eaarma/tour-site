"use client";

import { CreditCard, ShieldCheck } from "lucide-react";

type PaymentMethod = "stripe";

type PaymentMethodSectionProps = {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
};

export default function PaymentMethodSection({
  selected,
  onSelect,
}: PaymentMethodSectionProps) {
  return (
    <section className="rounded-[24px] border border-base-300 bg-base-100 p-6 shadow-sm sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
        Payment
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-base-content">
        Choose a secure method
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/60">
        Stripe securely handles card payments and authentication for you.
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => onSelect("stripe")}
          className={`flex w-full items-start justify-between gap-4 rounded-[22px] border p-5 text-left transition-all duration-200 ${
            selected === "stripe"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-base-300 hover:border-primary/50 hover:bg-base-200/40"
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-base-content">
                  Credit / Debit Card
                </p>
                <span className="rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium text-base-content/65">
                  Stripe
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-base-content/60">
                Pay securely with Visa, Mastercard, and other supported cards.
              </p>
            </div>
          </div>

          <span
            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              selected === "stripe"
                ? "border-primary"
                : "border-base-300"
            }`}
          >
            {selected === "stripe" && (
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </span>
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
        <div className="flex items-start gap-3 text-sm leading-6 text-base-content/70">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Your payment details are processed securely. We do not store card
            information on this site.
          </p>
        </div>
      </div>
    </section>
  );
}
