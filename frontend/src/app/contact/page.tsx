import type { Metadata } from "next";

import ContactPageContent from "@/components/contact/ContactPageContent";
import { getPublicStorePageOrFallback } from "@/lib/storefront/publicStorePage";
import { resolveStorePageTokens } from "@/lib/storefront/storePageDefaults";
import { getPublicStorefrontOrFallback } from "@/lib/storefront/publicStorefront";
import { buildStoreMetadata } from "@/lib/storefront/storeSeo";
import type { ContactPageContentDto } from "@/types/storePage";

export async function generateMetadata(): Promise<Metadata> {
  const [storefront, contactPage] = await Promise.all([
    getPublicStorefrontOrFallback(),
    getPublicStorePageOrFallback("contact"),
  ]);
  const page = resolveStorePageTokens(
    contactPage,
    storefront.contactEmail,
    storefront.siteName,
  );

  return buildStoreMetadata({
    storefront,
    pageTitle: page.title,
    description: page.description,
  });
}

export default async function ContactPage() {
  const [storefront, contactPage] = await Promise.all([
    getPublicStorefrontOrFallback(),
    getPublicStorePageOrFallback("contact"),
  ]);
  const page = resolveStorePageTokens(
    contactPage,
    storefront.contactEmail,
    storefront.siteName,
  );
  const content = page.contentJson as ContactPageContentDto;
  const locality = [storefront.city?.trim(), storefront.postalCode?.trim()]
    .filter((value): value is string => Boolean(value))
    .join(", ");
  const addressLines = storefront.showAddress
    ? [
        storefront.addressLine1?.trim() || null,
        storefront.addressLine2?.trim() || null,
        locality || null,
        storefront.country?.trim() || null,
      ].filter((value): value is string => Boolean(value))
    : [];

  return (
    <ContactPageContent
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      contactEmail={
        storefront.showContactEmail ? storefront.contactEmail?.trim() || null : null
      }
      supportPhone={
        storefront.showSupportPhone ? storefront.supportPhone?.trim() || null : null
      }
      addressLines={addressLines}
      businessHours={
        storefront.showBusinessHours
          ? storefront.businessHours?.trim() || null
          : null
      }
      detailsTitle={content.detailsTitle?.trim() || "Contact details"}
      detailsDescription={
        content.detailsDescription?.trim() ||
        "Use the information below for direct support or send us a message through the form."
      }
      bestForTitle={content.bestForTitle?.trim() || "Best for"}
      bestForDescription={
        content.bestForDescription?.trim() ||
        "Questions about tours, booking guidance, availability, or help choosing between experiences."
      }
      emptyDetailsMessage={
        content.emptyDetailsMessage?.trim() ||
        "Contact details have not been configured yet. You can still use the form and the message will be sent through the site contact route."
      }
      closingNote={page.closingNote}
      messageTitle={content.messageTitle?.trim() || "Message"}
      messageDescription={
        content.messageDescription?.trim() ||
        "Send a note and we'll get back to you as soon as we can."
      }
      submitButtonLabel={content.submitButtonLabel?.trim() || "Send"}
    />
  );
}

