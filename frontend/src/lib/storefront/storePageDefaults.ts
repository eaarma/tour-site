import type {
  ContactPageContentDto,
  FaqItemDto,
  FaqPageContentDto,
  PolicyPageContentDto,
  PolicySectionDto,
  StorePageContentBySlug,
  StorePageDto,
  StorePageSlug,
} from "@/types/storePage";

const CONTACT_EMAIL_TOKEN_PATTERN = /\{\{\s*contactEmail\s*\}\}/gi;
const SITE_NAME_TOKEN_PATTERN = /\{\{\s*siteName\s*\}\}/gi;

type StorePageMap = {
  [TSlug in StorePageSlug]: StorePageDto<StorePageContentBySlug[TSlug]>;
};

const DEFAULT_POLICY_PAGE_CREATED_AT = null;
const DEFAULT_POLICY_PAGE_UPDATED_AT = null;
const DEFAULT_CONTACT_EMAIL_FALLBACK = "the contact address listed on our website";
const DEFAULT_SITE_NAME_FALLBACK = "this website";

const normalizeOptionalString = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

export const DEFAULT_STORE_PAGES: StorePageMap = {
  faq: {
    id: null,
    slug: "faq",
    eyebrow: "Help center",
    title: "Frequently Asked Questions",
    description: null,
    contentJson: {
      items: [
        {
          question: "How do I confirm my booking?",
          answer:
            "A booking is confirmed once your payment has been successfully processed. You will receive a confirmation email with your booking details and meeting information.",
        },
        {
          question: "What is the difference between Public and Private tours?",
          answer:
            "Public tours are priced per person. The total cost depends on the number of participants selected.\n\nPrivate tours are priced per tour. The price is fixed for your group, regardless of the number of participants (within the allowed limit).",
        },
        {
          question: "Can I cancel my booking?",
          answer:
            "Yes. You may cancel your booking free of charge up to 24 hours before the scheduled tour start time.\n\nCancellations made within 24 hours of the tour start time are non-refundable.",
        },
        {
          question: "How do I cancel a booking?",
          answer:
            'You can cancel your booking through your account under "Upcoming Bookings" or via the link provided in your confirmation email.\n\nIf your booking qualifies for a refund, the refund will be processed automatically to your original payment method.',
        },
        {
          question: "How long does a refund take?",
          answer:
            "Refunds are issued to the original payment method and typically take 5-10 business days to appear, depending on your payment provider.",
        },
        {
          question: "What happens if I don't show up?",
          answer:
            "Failure to attend a scheduled tour without prior cancellation is considered a no-show and is non-refundable.",
        },
        {
          question: "Is my payment secure?",
          answer:
            "Yes. All payments are processed securely through Stripe. We do not store your full card details on our servers.",
        },
        {
          question: "Where do I find the meeting point?",
          answer:
            "The meeting point is displayed on the tour detail page and included in your booking confirmation email.",
        },
        {
          question: "Who is responsible for the tour?",
          answer:
            'Tours are operated by independent tour providers ("Shops"). They are responsible for delivering the tour experience. TourHub provides the booking and payment platform.',
        },
      ],
    },
    closingNote: null,
    createdAt: DEFAULT_POLICY_PAGE_CREATED_AT,
    updatedAt: DEFAULT_POLICY_PAGE_UPDATED_AT,
  },
  privacy: {
    id: null,
    slug: "privacy",
    eyebrow: "Legal",
    title: "Privacy Policy",
    description:
      'This Privacy Policy explains how TourHub ("we", "our", or "us") collects, uses, and protects your personal data when you use our platform to browse, book, and manage guided tours.',
    contentJson: {
      sections: [
        {
          title: "1. Information We Collect",
          body: "- Name and email address when creating an account\n- Booking details (selected tours, dates, participants)\n- Payment-related information processed via Stripe\n- Authentication data (JWT tokens stored securely)\n- Technical data such as IP address and browser type",
        },
        {
          title: "2. How We Use Your Data",
          body: "- To process bookings and manage orders\n- To authenticate users and maintain sessions\n- To send booking confirmations and important notifications\n- To improve system performance and security",
        },
        {
          title: "3. Payment Processing",
          body: "Payments are securely processed via Stripe. We do not store your full card details. Stripe may collect and process payment data in accordance with their own privacy policy.",
        },
        {
          title: "4. Cookies & Authentication",
          body: "We use secure HTTP-only cookies for authentication purposes. These cookies are required for login and session management and are not used for advertising.",
        },
        {
          title: "5. Data Retention",
          body: "We retain booking and account information as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time.",
        },
        {
          title: "6. Data Security",
          body: "We implement technical and organizational measures to protect your data, including encrypted connections (HTTPS), restricted server access, and monitoring systems.",
        },
        {
          title: "7. Your Rights",
          body: "Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. To exercise these rights, please contact us using the information below.",
        },
        {
          title: "8. Contact",
          body: "If you have questions about this Privacy Policy, please contact us at {{contactEmail}}.",
        },
      ],
    },
    closingNote: null,
    createdAt: DEFAULT_POLICY_PAGE_CREATED_AT,
    updatedAt: DEFAULT_POLICY_PAGE_UPDATED_AT,
  },
  terms: {
    id: null,
    slug: "terms",
    eyebrow: "Legal",
    title: "Terms & Conditions",
    description:
      "These Terms & Conditions govern your use of TourHub and the booking of guided tours through our platform. By using this website, you agree to these terms.",
    contentJson: {
      sections: [
        {
          title: "1. Platform Role",
          body: 'TourHub operates as an online marketplace connecting customers with independent tour operators ("Shops"). TourHub is not the organizer of the tours unless explicitly stated. The respective Shop is responsible for delivering the tour service.',
        },
        {
          title: "2. Bookings",
          body: "When placing an order, you agree to purchase the selected tour under the terms provided by the respective Shop.\n\n- Public tours are priced per participant.\n- Private tours are priced per tour (fixed group price).\n- A booking is confirmed only after successful payment processing.",
        },
        {
          title: "3. Payments",
          body: "Payments are processed securely via Stripe. By completing a payment, you authorize the charge shown at checkout.\n\nTourHub may collect a platform service fee. The final price is displayed before payment confirmation.",
        },
        {
          title: "4. Cancellations & Refunds",
          body: "Cancellation and refund policies are determined by the respective Shop and may vary per tour. Please review the specific cancellation terms listed for each tour before booking.",
        },
        {
          title: "5. User Accounts",
          body: "Users are responsible for maintaining the confidentiality of their login credentials. You agree not to misuse the platform or attempt unauthorized access to other accounts.",
        },
        {
          title: "6. Liability",
          body: "TourHub is not liable for the execution, safety, or quality of tours provided by independent Shops. Any claims related to the tour service must be directed to the responsible Shop.",
        },
        {
          title: "7. Modifications",
          body: "We reserve the right to modify these Terms at any time. Updated versions will be published on this page.",
        },
        {
          title: "8. Contact",
          body: "For questions regarding these Terms, please contact {{contactEmail}}.",
        },
      ],
    },
    closingNote: null,
    createdAt: DEFAULT_POLICY_PAGE_CREATED_AT,
    updatedAt: DEFAULT_POLICY_PAGE_UPDATED_AT,
  },
  refund: {
    id: null,
    slug: "refund",
    eyebrow: "Store policy",
    title: "Cancellation Policy",
    description:
      "This Cancellation Policy explains how booking cancellations and refunds are handled on TourHub.",
    contentJson: {
      sections: [
        {
          title: "1. Free Cancellation",
          body: "Customers may cancel their booking free of charge up to 24 hours before the scheduled start time of the tour.",
        },
        {
          title: "2. Non-Refundable Period",
          body: "Cancellations made within 24 hours of the scheduled tour start time are non-refundable.",
        },
        {
          title: "3. No-Show Policy",
          body: 'Failure to attend a scheduled tour without prior cancellation ("no-show") is considered non-refundable.',
        },
        {
          title: "4. Refund Processing",
          body: "Approved refunds will be issued to the original payment method used during checkout.\n\nRefund processing times may vary depending on your payment provider, but typically take 5-10 business days to appear on your statement.",
        },
        {
          title: "5. Exceptions",
          body: "In exceptional circumstances (such as severe weather, safety concerns, or tour operator cancellation), alternative arrangements or refunds may be offered at the discretion of the tour operator.",
        },
      ],
    },
    closingNote: null,
    createdAt: DEFAULT_POLICY_PAGE_CREATED_AT,
    updatedAt: DEFAULT_POLICY_PAGE_UPDATED_AT,
  },
  contact: {
    id: null,
    slug: "contact",
    eyebrow: "{{siteName}}",
    title: "Get in touch",
    description:
      "We'd love to hear from you. Whether you have a question about our tours, booking, or just want help choosing the right experience, feel free to reach out.",
    contentJson: {
      detailsTitle: "Contact details",
      detailsDescription:
        "Use the information below for direct support or send us a message through the form.",
      bestForTitle: "Best for",
      bestForDescription:
        "Questions about tours, booking guidance, availability, or help choosing between experiences.",
      messageTitle: "Message",
      messageDescription:
        "Send a note and we'll get back to you as soon as we can.",
      emptyDetailsMessage:
        "Contact details have not been configured yet. You can still use the form and the message will be sent through the site contact route.",
      submitButtonLabel: "Send",
    },
    closingNote:
      "We usually recommend including the tour name, date, and any special questions so it's easier to help you quickly.",
    createdAt: DEFAULT_POLICY_PAGE_CREATED_AT,
    updatedAt: DEFAULT_POLICY_PAGE_UPDATED_AT,
  },
};

function normalizeFaqItems(items: FaqItemDto[] | null | undefined, fallback: FaqItemDto[]) {
  const source = Array.isArray(items) ? items : fallback;

  return source
    .map((item, index) => ({
      question:
        normalizeOptionalString(item?.question) ??
        normalizeOptionalString(fallback[index]?.question) ??
        "",
      answer:
        normalizeOptionalString(item?.answer) ??
        normalizeOptionalString(fallback[index]?.answer) ??
        "",
    }))
    .filter((item) => item.question || item.answer);
}

function normalizePolicySections(
  sections: PolicySectionDto[] | null | undefined,
  fallback: PolicySectionDto[],
) {
  const source = Array.isArray(sections) ? sections : fallback;

  return source
    .map((section, index) => ({
      title:
        normalizeOptionalString(section?.title) ??
        normalizeOptionalString(fallback[index]?.title) ??
        "",
      body:
        normalizeOptionalString(section?.body) ??
        normalizeOptionalString(fallback[index]?.body) ??
        "",
    }))
    .filter((section) => section.title || section.body);
}

function normalizeContactContent(
  content: ContactPageContentDto | null | undefined,
  fallback: ContactPageContentDto,
): ContactPageContentDto {
  return {
    detailsTitle:
      normalizeOptionalString(content?.detailsTitle) ??
      normalizeOptionalString(fallback.detailsTitle) ??
      "",
    detailsDescription:
      normalizeOptionalString(content?.detailsDescription) ??
      normalizeOptionalString(fallback.detailsDescription) ??
      "",
    bestForTitle:
      normalizeOptionalString(content?.bestForTitle) ??
      normalizeOptionalString(fallback.bestForTitle) ??
      "",
    bestForDescription:
      normalizeOptionalString(content?.bestForDescription) ??
      normalizeOptionalString(fallback.bestForDescription) ??
      "",
    messageTitle:
      normalizeOptionalString(content?.messageTitle) ??
      normalizeOptionalString(fallback.messageTitle) ??
      "",
    messageDescription:
      normalizeOptionalString(content?.messageDescription) ??
      normalizeOptionalString(fallback.messageDescription) ??
      "",
    emptyDetailsMessage:
      normalizeOptionalString(content?.emptyDetailsMessage) ??
      normalizeOptionalString(fallback.emptyDetailsMessage) ??
      "",
    submitButtonLabel:
      normalizeOptionalString(content?.submitButtonLabel) ??
      normalizeOptionalString(fallback.submitButtonLabel) ??
      "",
  };
}

export function normalizeStorePage<TSlug extends StorePageSlug>(
  slug: TSlug,
  page?: Partial<StorePageDto<StorePageContentBySlug[TSlug]>> | null,
): StorePageDto<StorePageContentBySlug[TSlug]> {
  const fallback = DEFAULT_STORE_PAGES[slug];

  if (slug === "faq") {
    return {
      ...fallback,
      ...page,
      slug,
      eyebrow: normalizeOptionalString(page?.eyebrow) ?? fallback.eyebrow,
      title: normalizeOptionalString(page?.title) ?? fallback.title,
      description: normalizeOptionalString(page?.description),
      contentJson: {
        items: normalizeFaqItems(
          (page?.contentJson as FaqPageContentDto | undefined)?.items,
          (fallback.contentJson as FaqPageContentDto).items ?? [],
        ),
      } as StorePageContentBySlug[TSlug],
      closingNote: normalizeOptionalString(page?.closingNote),
    };
  }

  if (slug === "contact") {
    return {
      ...fallback,
      ...page,
      slug,
      eyebrow: normalizeOptionalString(page?.eyebrow) ?? fallback.eyebrow,
      title: normalizeOptionalString(page?.title) ?? fallback.title,
      description: normalizeOptionalString(page?.description) ?? fallback.description,
      contentJson: normalizeContactContent(
        page?.contentJson as ContactPageContentDto | undefined,
        fallback.contentJson as ContactPageContentDto,
      ) as StorePageContentBySlug[TSlug],
      closingNote:
        normalizeOptionalString(page?.closingNote) ?? fallback.closingNote,
    };
  }

  return {
    ...fallback,
    ...page,
    slug,
    eyebrow: normalizeOptionalString(page?.eyebrow) ?? fallback.eyebrow,
    title: normalizeOptionalString(page?.title) ?? fallback.title,
    description: normalizeOptionalString(page?.description) ?? fallback.description,
    contentJson: {
      sections: normalizePolicySections(
        (page?.contentJson as PolicyPageContentDto | undefined)?.sections,
        (fallback.contentJson as PolicyPageContentDto).sections ?? [],
      ),
    } as StorePageContentBySlug[TSlug],
    closingNote: normalizeOptionalString(page?.closingNote),
  };
}

const replaceTokens = (
  value: string | null | undefined,
  contactEmail?: string | null,
  siteName?: string | null,
) => {
  const normalizedValue = normalizeOptionalString(value);

  if (!normalizedValue) {
    return normalizedValue;
  }

  return normalizedValue
    .replace(
      CONTACT_EMAIL_TOKEN_PATTERN,
      contactEmail?.trim() || DEFAULT_CONTACT_EMAIL_FALLBACK,
    )
    .replace(SITE_NAME_TOKEN_PATTERN, siteName?.trim() || DEFAULT_SITE_NAME_FALLBACK);
};

export function resolveStorePageTokens<TSlug extends StorePageSlug>(
  page: StorePageDto<StorePageContentBySlug[TSlug]>,
  contactEmail?: string | null,
  siteName?: string | null,
): StorePageDto<StorePageContentBySlug[TSlug]> {
  if (page.slug === "faq") {
    return {
      ...page,
      eyebrow: replaceTokens(page.eyebrow, contactEmail, siteName) ?? page.eyebrow,
      title: replaceTokens(page.title, contactEmail, siteName) ?? page.title,
      description: replaceTokens(page.description, contactEmail, siteName),
      closingNote: replaceTokens(page.closingNote, contactEmail, siteName),
      contentJson: {
        items: (page.contentJson as FaqPageContentDto).items?.map((item) => ({
          question: replaceTokens(item.question, contactEmail, siteName),
          answer: replaceTokens(item.answer, contactEmail, siteName),
        })),
      } as StorePageContentBySlug[TSlug],
    };
  }

  if (page.slug === "contact") {
    const content = page.contentJson as ContactPageContentDto;

    return {
      ...page,
      eyebrow: replaceTokens(page.eyebrow, contactEmail, siteName) ?? page.eyebrow,
      title: replaceTokens(page.title, contactEmail, siteName) ?? page.title,
      description: replaceTokens(page.description, contactEmail, siteName),
      closingNote: replaceTokens(page.closingNote, contactEmail, siteName),
      contentJson: {
        detailsTitle: replaceTokens(
          content.detailsTitle,
          contactEmail,
          siteName,
        ),
        detailsDescription: replaceTokens(
          content.detailsDescription,
          contactEmail,
          siteName,
        ),
        bestForTitle: replaceTokens(
          content.bestForTitle,
          contactEmail,
          siteName,
        ),
        bestForDescription: replaceTokens(
          content.bestForDescription,
          contactEmail,
          siteName,
        ),
        messageTitle: replaceTokens(
          content.messageTitle,
          contactEmail,
          siteName,
        ),
        messageDescription: replaceTokens(
          content.messageDescription,
          contactEmail,
          siteName,
        ),
        emptyDetailsMessage: replaceTokens(
          content.emptyDetailsMessage,
          contactEmail,
          siteName,
        ),
        submitButtonLabel: replaceTokens(
          content.submitButtonLabel,
          contactEmail,
          siteName,
        ),
      } as StorePageContentBySlug[TSlug],
    };
  }

  return {
    ...page,
    eyebrow: replaceTokens(page.eyebrow, contactEmail, siteName) ?? page.eyebrow,
    title: replaceTokens(page.title, contactEmail, siteName) ?? page.title,
    description: replaceTokens(page.description, contactEmail, siteName),
    closingNote: replaceTokens(page.closingNote, contactEmail, siteName),
    contentJson: {
      sections: (page.contentJson as PolicyPageContentDto).sections?.map(
        (section) => ({
          title: replaceTokens(section.title, contactEmail, siteName),
          body: replaceTokens(section.body, contactEmail, siteName),
        }),
      ),
    } as StorePageContentBySlug[TSlug],
  };
}

export function formatStorePageUpdatedLabel(value?: string | null) {
  const resolvedDate = value ? new Date(value) : new Date();

  if (Number.isNaN(resolvedDate.getTime())) {
    return `${new Date().getFullYear()}`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(resolvedDate);
}
