export default function PrivacyPolicyPage() {
  return (
    <div className="bg-base-100 min-h-screen flex justify-center p-6">
      <div className="card max-w-3xl w-full bg-base-100 shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>

        <p>
          This Privacy Policy explains how TourHub (&quot;we&quot;,
          &quot;our&quot;, or &quot;us&quot;) collects, uses, and protects your
          personal data when you use our platform to browse, book, and manage
          guided tours.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Name and email address when creating an account</li>
            <li>Booking details (selected tours, dates, participants)</li>
            <li>Payment-related information processed via Stripe</li>
            <li>Authentication data (JWT tokens stored securely)</li>
            <li>Technical data such as IP address and browser type</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To process bookings and manage orders</li>
            <li>To authenticate users and maintain sessions</li>
            <li>To send booking confirmations and important notifications</li>
            <li>To improve system performance and security</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Payment Processing</h2>
          <p>
            Payments are securely processed via Stripe. We do not store your
            full card details. Stripe may collect and process payment data in
            accordance with their own privacy policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Cookies & Authentication</h2>
          <p>
            We use secure HTTP-only cookies for authentication purposes. These
            cookies are required for login and session management and are not
            used for advertising.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Data Retention</h2>
          <p>
            We retain booking and account information as long as necessary to
            provide our services and comply with legal obligations. You may
            request deletion of your account at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">6. Data Security</h2>
          <p>
            We implement technical and organizational measures to protect your
            data, including encrypted connections (HTTPS), restricted server
            access, and monitoring systems.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">7. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to access,
            correct, or delete your personal data. To exercise these rights,
            please contact us using the information below.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">8. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at: {process.env.NEXT_PUBLIC_SITE_EMAIL}
          </p>
        </section>

        <p className="text-sm opacity-70">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
