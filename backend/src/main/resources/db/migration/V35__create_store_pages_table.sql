CREATE TABLE IF NOT EXISTS store_pages (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(60) NOT NULL UNIQUE,
    eyebrow VARCHAR(120) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    content_json TEXT NOT NULL,
    closing_note VARCHAR(2000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO store_pages (
    slug,
    eyebrow,
    title,
    description,
    content_json,
    closing_note
) VALUES
(
    'faq',
    'Help center',
    'Frequently Asked Questions',
    NULL,
    $${
      "items": [
        {
          "question": "How do I confirm my booking?",
          "answer": "A booking is confirmed once your payment has been successfully processed. You will receive a confirmation email with your booking details and meeting information."
        },
        {
          "question": "What is the difference between Public and Private tours?",
          "answer": "Public tours are priced per person. The total cost depends on the number of participants selected.\n\nPrivate tours are priced per tour. The price is fixed for your group, regardless of the number of participants (within the allowed limit)."
        },
        {
          "question": "Can I cancel my booking?",
          "answer": "Yes. You may cancel your booking free of charge up to 24 hours before the scheduled tour start time.\n\nCancellations made within 24 hours of the tour start time are non-refundable."
        },
        {
          "question": "How do I cancel a booking?",
          "answer": "You can cancel your booking through your account under \"Upcoming Bookings\" or via the link provided in your confirmation email.\n\nIf your booking qualifies for a refund, the refund will be processed automatically to your original payment method."
        },
        {
          "question": "How long does a refund take?",
          "answer": "Refunds are issued to the original payment method and typically take 5-10 business days to appear, depending on your payment provider."
        },
        {
          "question": "What happens if I don't show up?",
          "answer": "Failure to attend a scheduled tour without prior cancellation is considered a no-show and is non-refundable."
        },
        {
          "question": "Is my payment secure?",
          "answer": "Yes. All payments are processed securely through Stripe. We do not store your full card details on our servers."
        },
        {
          "question": "Where do I find the meeting point?",
          "answer": "The meeting point is displayed on the tour detail page and included in your booking confirmation email."
        },
        {
          "question": "Who is responsible for the tour?",
          "answer": "Tours are operated by independent tour providers (\"Shops\"). They are responsible for delivering the tour experience. TourHub provides the booking and payment platform."
        }
      ]
    }$$,
    NULL
),
(
    'privacy',
    'Legal',
    'Privacy Policy',
    'This Privacy Policy explains how TourHub ("we", "our", or "us") collects, uses, and protects your personal data when you use our platform to browse, book, and manage guided tours.',
    $${
      "sections": [
        {
          "title": "1. Information We Collect",
          "body": "- Name and email address when creating an account\n- Booking details (selected tours, dates, participants)\n- Payment-related information processed via Stripe\n- Authentication data (JWT tokens stored securely)\n- Technical data such as IP address and browser type"
        },
        {
          "title": "2. How We Use Your Data",
          "body": "- To process bookings and manage orders\n- To authenticate users and maintain sessions\n- To send booking confirmations and important notifications\n- To improve system performance and security"
        },
        {
          "title": "3. Payment Processing",
          "body": "Payments are securely processed via Stripe. We do not store your full card details. Stripe may collect and process payment data in accordance with their own privacy policy."
        },
        {
          "title": "4. Cookies & Authentication",
          "body": "We use secure HTTP-only cookies for authentication purposes. These cookies are required for login and session management and are not used for advertising."
        },
        {
          "title": "5. Data Retention",
          "body": "We retain booking and account information as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time."
        },
        {
          "title": "6. Data Security",
          "body": "We implement technical and organizational measures to protect your data, including encrypted connections (HTTPS), restricted server access, and monitoring systems."
        },
        {
          "title": "7. Your Rights",
          "body": "Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. To exercise these rights, please contact us using the information below."
        },
        {
          "title": "8. Contact",
          "body": "If you have questions about this Privacy Policy, please contact us at {{contactEmail}}."
        }
      ]
    }$$,
    NULL
),
(
    'terms',
    'Legal',
    'Terms & Conditions',
    'These Terms & Conditions govern your use of TourHub and the booking of guided tours through our platform. By using this website, you agree to these terms.',
    $${
      "sections": [
        {
          "title": "1. Platform Role",
          "body": "TourHub operates as an online marketplace connecting customers with independent tour operators (\"Shops\"). TourHub is not the organizer of the tours unless explicitly stated. The respective Shop is responsible for delivering the tour service."
        },
        {
          "title": "2. Bookings",
          "body": "When placing an order, you agree to purchase the selected tour under the terms provided by the respective Shop.\n\n- Public tours are priced per participant.\n- Private tours are priced per tour (fixed group price).\n- A booking is confirmed only after successful payment processing."
        },
        {
          "title": "3. Payments",
          "body": "Payments are processed securely via Stripe. By completing a payment, you authorize the charge shown at checkout.\n\nTourHub may collect a platform service fee. The final price is displayed before payment confirmation."
        },
        {
          "title": "4. Cancellations & Refunds",
          "body": "Cancellation and refund policies are determined by the respective Shop and may vary per tour. Please review the specific cancellation terms listed for each tour before booking."
        },
        {
          "title": "5. User Accounts",
          "body": "Users are responsible for maintaining the confidentiality of their login credentials. You agree not to misuse the platform or attempt unauthorized access to other accounts."
        },
        {
          "title": "6. Liability",
          "body": "TourHub is not liable for the execution, safety, or quality of tours provided by independent Shops. Any claims related to the tour service must be directed to the responsible Shop."
        },
        {
          "title": "7. Modifications",
          "body": "We reserve the right to modify these Terms at any time. Updated versions will be published on this page."
        },
        {
          "title": "8. Contact",
          "body": "For questions regarding these Terms, please contact {{contactEmail}}."
        }
      ]
    }$$,
    NULL
),
(
    'refund',
    'Store policy',
    'Cancellation Policy',
    'This Cancellation Policy explains how booking cancellations and refunds are handled on TourHub.',
    $${
      "sections": [
        {
          "title": "1. Free Cancellation",
          "body": "Customers may cancel their booking free of charge up to 24 hours before the scheduled start time of the tour."
        },
        {
          "title": "2. Non-Refundable Period",
          "body": "Cancellations made within 24 hours of the scheduled tour start time are non-refundable."
        },
        {
          "title": "3. No-Show Policy",
          "body": "Failure to attend a scheduled tour without prior cancellation (\"no-show\") is considered non-refundable."
        },
        {
          "title": "4. Refund Processing",
          "body": "Approved refunds will be issued to the original payment method used during checkout.\n\nRefund processing times may vary depending on your payment provider, but typically take 5-10 business days to appear on your statement."
        },
        {
          "title": "5. Exceptions",
          "body": "In exceptional circumstances (such as severe weather, safety concerns, or tour operator cancellation), alternative arrangements or refunds may be offered at the discretion of the tour operator."
        }
      ]
    }$$,
    NULL
)
ON CONFLICT (slug) DO NOTHING;
