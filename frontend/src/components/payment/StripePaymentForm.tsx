"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

interface Props {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setErrorMsg("Card input missing");
      setLoading(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error.message || "Payment failed");
      onError(result.error.message || "Payment failed");
    } else if (result.paymentIntent?.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">Secure Payment</h2>
        <p className="text-sm opacity-70">Complete your booking</p>
      </div>

      {/* Amount */}
      <div className="bg-base-200 rounded-lg p-4 text-center">
        <p className="text-sm opacity-60">Total</p>
        <p className="text-2xl font-bold">€{amount.toFixed(2)}</p>
      </div>

      {/* Card Input */}
      <div>
        <label className="text-sm font-medium block mb-2">Card Details</label>

        <div className="border border-base-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-primary transition">
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

      {/* Error */}
      {errorMsg && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={loading || !stripe}
        className="btn btn-primary w-full rounded-lg"
      >
        {loading ? "Processing…" : `Pay €${amount.toFixed(2)}`}
      </button>

      {/* Trust footer */}
      <div className="text-xs text-center opacity-60">
        🔒 Securely processed by Stripe
      </div>
    </div>
  );
}
