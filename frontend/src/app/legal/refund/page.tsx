import type { Metadata } from "next";

import StorePolicyPage from "@/components/legal/StorePolicyPage";
import { getPublicStorePageOrFallback } from "@/lib/storefront/publicStorePage";
import { getPublicStorefrontOrFallback } from "@/lib/storefront/publicStorefront";
import { resolveStorePageTokens } from "@/lib/storefront/storePageDefaults";
import { buildStoreMetadata } from "@/lib/storefront/storeSeo";
import type {
  PolicyPageContentDto,
  StorePageDto,
} from "@/types/storePage";

export async function generateMetadata(): Promise<Metadata> {
  const [loadedPage, storefront] = await Promise.all([
    getPublicStorePageOrFallback("refund"),
    getPublicStorefrontOrFallback(),
  ]);
  const page = resolveStorePageTokens(
    loadedPage,
    storefront.contactEmail,
    storefront.siteName,
  ) as StorePageDto<PolicyPageContentDto>;

  return buildStoreMetadata({
    storefront,
    pageTitle: page.title,
    description: page.description,
  });
}

export default async function CancellationRefundPolicyPage() {
  const [loadedPage, storefront] = await Promise.all([
    getPublicStorePageOrFallback("refund"),
    getPublicStorefrontOrFallback(),
  ]);
  const page = resolveStorePageTokens(
    loadedPage,
    storefront.contactEmail,
    storefront.siteName,
  ) as StorePageDto<PolicyPageContentDto>;

  return <StorePolicyPage page={page} />;
}

