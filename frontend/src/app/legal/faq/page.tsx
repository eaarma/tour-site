export default function FAQPage() {
  return (
    <div className="bg-base-100 min-h-screen flex justify-center p-6">
      <div className="card max-w-3xl w-full bg-base-100 shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            How do I confirm my booking?
          </h2>
          <p>
            A booking is confirmed once your payment has been successfully
            processed. You will receive a confirmation email with your booking
            details and meeting information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            What is the difference between Public and Private tours?
          </h2>
          <p>
            Public tours are priced per person. The total cost depends on the
            number of participants selected.
          </p>
          <p>
            Private tours are priced per tour. The price is fixed for your
            group, regardless of the number of participants (within the allowed
            limit).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Can I cancel my booking?</h2>
          <p>
            Yes. You may cancel your booking free of charge up to 24 hours
            before the scheduled tour start time.
          </p>
          <p>
            Cancellations made within 24 hours of the tour start time are
            non-refundable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">How do I cancel a booking?</h2>
          <p>
            You can cancel your booking through your account under “Upcoming
            Bookings” or via the link provided in your confirmation email.
          </p>
          <p>
            If your booking qualifies for a refund, the refund will be processed
            automatically to your original payment method.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            How long does a refund take?
          </h2>
          <p>
            Refunds are issued to the original payment method and typically take
            5–10 business days to appear, depending on your payment provider.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            What happens if I don’t show up?
          </h2>
          <p>
            Failure to attend a scheduled tour without prior cancellation is
            considered a no-show and is non-refundable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Is my payment secure?</h2>
          <p>
            Yes. All payments are processed securely through Stripe. We do not
            store your full card details on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            Where do I find the meeting point?
          </h2>
          <p>
            The meeting point is displayed on the tour detail page and included
            in your booking confirmation email.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            Who is responsible for the tour?
          </h2>
          <p>
            Tours are operated by independent tour providers (“Shops”). They are
            responsible for delivering the tour experience. TourHub provides the
            booking and payment platform.
          </p>
        </section>

        <p className="text-sm opacity-70">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
