export default function CancellationRefundPolicyPage() {
  return (
    <div className="bg-base-100 min-h-screen flex justify-center p-6">
      <div className="card max-w-3xl w-full bg-base-100 shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold">Cancellation Policy</h1>

        <p>
          This Cancellation Policy explains how booking cancellations and
          refunds are handled on TourHub.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Free Cancellation</h2>
          <p>
            Customers may cancel their booking free of charge up to
            <strong> 24 hours before the scheduled start time</strong> of the
            tour.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Non-Refundable Period</h2>
          <p>
            Cancellations made within 24 hours of the scheduled tour start time
            are <strong>non-refundable</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. No-Show Policy</h2>
          <p>
            Failure to attend a scheduled tour without prior cancellation
            (&quot;no-show&quot;) is considered non-refundable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Refund Processing</h2>
          <p>
            Approved refunds will be issued to the original payment method used
            during checkout.
          </p>
          <p>
            Refund processing times may vary depending on your payment provider,
            but typically take <strong>5–10 business days</strong> to appear on
            your statement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Exceptions</h2>
          <p>
            In exceptional circumstances (such as severe weather, safety
            concerns, or tour operator cancellation), alternative arrangements
            or refunds may be offered at the discretion of the tour operator.
          </p>
        </section>

        <p className="text-sm opacity-70">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
