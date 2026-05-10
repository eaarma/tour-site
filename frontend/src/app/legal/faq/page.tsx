import type { Metadata } from "next";

import StoreFaqPage from "@/components/legal/StoreFaqPage";
import { getPublicStorePageOrFallback } from "@/lib/storefront/publicStorePage";
import { getPublicStorefrontOrFallback } from "@/lib/storefront/publicStorefront";
import { resolveStorePageTokens } from "@/lib/storefront/storePageDefaults";
import { buildStoreMetadata } from "@/lib/storefront/storeSeo";
import type { FaqPageContentDto, StorePageDto } from "@/types/storePage";

export async function generateMetadata(): Promise<Metadata> {
  const [loadedPage, storefront] = await Promise.all([
    getPublicStorePageOrFallback("faq"),
    getPublicStorefrontOrFallback(),
  ]);
  const page = resolveStorePageTokens(
    loadedPage,
    storefront.contactEmail,
    storefront.siteName,
  ) as StorePageDto<FaqPageContentDto>;

  return buildStoreMetadata({
    storefront,
    pageTitle: page.title,
    description: page.description,
    fallbackDescription:
      "Find answers to common questions about bookings, payments, cancellations, and tour logistics.",
  });
}

export default async function FAQPage() {
  const [loadedPage, storefront] = await Promise.all([
    getPublicStorePageOrFallback("faq"),
    getPublicStorefrontOrFallback(),
  ]);
  const page = resolveStorePageTokens(
    loadedPage,
    storefront.contactEmail,
    storefront.siteName,
  ) as StorePageDto<FaqPageContentDto>;

  return <StoreFaqPage page={page} />;
}

