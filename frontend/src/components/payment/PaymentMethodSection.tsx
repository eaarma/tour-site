"use client";

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
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg w-full max-w-2xl border border-base-300">
      <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>

      <div className="space-y-4">
        {/* Stripe Option */}
        <button
          type="button"
          onClick={() => onSelect("stripe")}
          className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${
            selected === "stripe"
              ? "border-primary bg-primary/5 ring-2 ring-primary"
              : "border-base-300 hover:border-primary hover:bg-base-200"
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Stripe Icon */}
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>

            <div className="text-left">
              <p className="font-semibold">Credit / Debit Card</p>
              <p className="text-sm opacity-70">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>

          {/* Selected Indicator */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === "stripe" ? "border-primary" : "border-base-300"
            }`}
          >
            {selected === "stripe" && (
              <div className="w-2.5 h-2.5 bg-primary rounded-full" />
            )}
          </div>
        </button>
      </div>

      <div className="mt-6 text-sm opacity-70">
        Your payment details are securely processed. We do not store card
        information.
      </div>
    </div>
  );
}
