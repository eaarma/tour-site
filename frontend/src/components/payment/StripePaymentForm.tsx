"use client";

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMemo, useRef, useState } from "react";

interface Props {
  clientSecret: string;
  amount: number;
  currency?: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  currency = "EUR",
  onSuccess,
  onError,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const formattedAmount = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount),
    [amount, currency],
  );

  const handlePay = async () => {
    if (!stripe || !elements || submitLockRef.current) return;

    submitLockRef.current = true;
    setLoading(true);
    setErrorMsg(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      const message = "Card input missing";
      setErrorMsg(message);
      onError(message);
      submitLockRef.current = false;
      setLoading(false);
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        const message = result.error.message || "Payment failed";
        setErrorMsg(message);
        onError(message);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        onSuccess();
        return;
      }

      const message = "Payment is not complete yet";
      setErrorMsg(message);
      onError(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Payment failed";
      setErrorMsg(message);
      onError(message);
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
          Secure Payment
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-base-content">
          Complete payment
        </h2>
        <p className="mt-2 text-sm leading-6 text-base-content/65">
          Your card details stay with Stripe and are processed through their
          secure payment flow.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/15 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/55">
          Total
        </p>
        <p className="mt-2 text-3xl font-bold text-base-content">
          {formattedAmount}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-base-content/80">
          Card Details
        </label>

        <div className="rounded-2xl border border-base-300 bg-white p-4 shadow-sm transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: "16px",
                  color: "#111827",
                  "::placeholder": {
                    color: "#9CA3AF",
                  },
                },
                invalid: {
                  color: "#EF4444",
                },
              },
            }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-error/20 bg-error/5 p-4 text-sm leading-6 text-error">
          {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={loading || !stripe}
        className="btn btn-primary h-12 w-full text-base"
      >
        {loading ? "Processing..." : `Pay ${formattedAmount}`}
      </button>

      <div className="text-center text-xs leading-5 text-base-content/55">
        Securely processed by Stripe
      </div>
    </div>
  );
}
