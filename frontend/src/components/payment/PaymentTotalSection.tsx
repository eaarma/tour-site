"use client";

type PaymentTotalSectionProps = {
  subtotal: number;
  tax?: number;
  onProceed: () => void;
  isLoading?: boolean;
};

export default function PaymentTotalSection({
  subtotal,
  tax = 0,
  onProceed,
  isLoading = false,
}: PaymentTotalSectionProps) {
  const total = subtotal + tax;

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-sm">
      <h2 className="text-2xl font-semibold mb-4">Order Total</h2>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>

        <hr className="my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={onProceed}
        className="btn btn-primary w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </button>
    </div>
  );
}
