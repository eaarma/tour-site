export default function TermsOfServicePage() {
  return (
    <div className="bg-base-100 min-h-screen flex justify-center p-6">
      <div className="card max-w-3xl w-full bg-base-100 shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>

        <p>
          These Terms & Conditions govern your use of TourHub and the booking of
          guided tours through our platform. By using this website, you agree to
          these terms.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Platform Role</h2>
          <p>
            TourHub operates as an online marketplace connecting customers with
            independent tour operators (&quot;Shops&quot;). TourHub is not the
            organizer of the tours unless explicitly stated. The respective Shop
            is responsible for delivering the tour service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Bookings</h2>
          <p>
            When placing an order, you agree to purchase the selected tour under
            the terms provided by the respective Shop.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Public tours are priced per participant.</li>
            <li>Private tours are priced per tour (fixed group price).</li>
            <li>
              A booking is confirmed only after successful payment processing.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Payments</h2>
          <p>
            Payments are processed securely via Stripe. By completing a payment,
            you authorize the charge shown at checkout.
          </p>
          <p>
            TourHub may collect a platform service fee. The final price is
            displayed before payment confirmation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Cancellations & Refunds</h2>
          <p>
            Cancellation and refund policies are determined by the respective
            Shop and may vary per tour. Please review the specific cancellation
            terms listed for each tour before booking.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. User Accounts</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their
            login credentials. You agree not to misuse the platform or attempt
            unauthorized access to other accounts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">6. Liability</h2>
          <p>
            TourHub is not liable for the execution, safety, or quality of tours
            provided by independent Shops. Any claims related to the tour
            service must be directed to the responsible Shop.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">7. Modifications</h2>
          <p>
            We reserve the right to modify these Terms at any time. Updated
            versions will be published on this page.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">8. Contact</h2>
          <p>
            For questions regarding these Terms, please contact:
            helpsprtcontact@gmail.com
          </p>
        </section>

        <p className="text-sm opacity-70">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
