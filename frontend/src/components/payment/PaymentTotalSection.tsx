"use client";

type PaymentTotalSectionProps = {
  subtotal: number;
  tax?: number;
  currency?: string;
  onProceed: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  actionLabel?: string;
};

const formatPrice = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);

export default function PaymentTotalSection({
  subtotal,
  tax = 0,
  currency = "EUR",
  onProceed,
  isLoading = false,
  disabled = false,
  actionLabel = "Continue to Secure Payment",
}: PaymentTotalSectionProps) {
  const total = subtotal + tax;

  return (
    <section className="rounded-[24px] border border-base-300 bg-base-100 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
        Payment
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-base-content">
        Order Total
      </h2>
      <p className="mt-2 text-sm leading-6 text-base-content/60">
        When you continue, Stripe will open a secure card form for the final
        payment step.
      </p>

      <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/35 p-5">
        <div className="space-y-3 text-sm text-base-content/70">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, currency)}</span>
          </div>

          {tax !== 0 && (
            <div className="flex items-center justify-between">
              <span>Taxes and fees</span>
              <span>{formatPrice(tax, currency)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-base-300 pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50">
              Total Due
            </p>
            <p className="mt-1 text-3xl font-bold text-base-content">
              {formatPrice(total, currency)}
            </p>
          </div>

          <p className="text-xs text-base-content/55">
            Securely charged via Stripe
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onProceed}
        className="btn btn-primary mt-6 h-12 w-full text-base"
        disabled={disabled || isLoading}
      >
        {isLoading ? "Processing..." : actionLabel}
      </button>
    </section>
  );
}
