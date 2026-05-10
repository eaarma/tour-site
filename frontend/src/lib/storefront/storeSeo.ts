import type { Metadata } from "next";

import {
  DEFAULT_STOREFRONT_SETTINGS,
  type StorefrontSettingsDto,
} from "@/types/storefront";

type BuildStoreMetadataOptions = {
  storefront: StorefrontSettingsDto;
  pageTitle?: string | null;
  description?: string | null;
  fallbackDescription?: string | null;
  keywords?: string | null;
  ogImageUrl?: string | null;
};

const trimOptionalString = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export function buildMetadataTitle(
  storefront: StorefrontSettingsDto,
  pageTitle?: string | null,
) {
  const baseTitle =
    trimOptionalString(storefront.seoTitle) ||
    trimOptionalString(storefront.siteName) ||
    DEFAULT_STOREFRONT_SETTINGS.siteName;
  const resolvedPageTitle = trimOptionalString(pageTitle);

  if (!resolvedPageTitle || resolvedPageTitle === baseTitle) {
    return baseTitle;
  }

  return `${resolvedPageTitle} | ${baseTitle}`;
}

export function buildMetadataDescription(
  storefront: StorefrontSettingsDto,
  description?: string | null,
  fallbackDescription?: string | null,
) {
  return (
    trimOptionalString(description) ||
    trimOptionalString(storefront.seoDescription) ||
    trimOptionalString(fallbackDescription) ||
    trimOptionalString(DEFAULT_STOREFRONT_SETTINGS.seoDescription) ||
    undefined
  );
}

export function buildMetadataKeywords(
  keywords?: string | null,
  fallbackKeywords?: string | null,
) {
  const rawKeywords =
    trimOptionalString(keywords) || trimOptionalString(fallbackKeywords);

  if (!rawKeywords) {
    return undefined;
  }

  const parsedKeywords = rawKeywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return parsedKeywords.length > 0 ? parsedKeywords : undefined;
}

export function resolveMetadataImage(
  storefront: StorefrontSettingsDto,
  ogImageUrl?: string | null,
) {
  return (
    trimOptionalString(ogImageUrl) ||
    trimOptionalString(storefront.ogImageUrl) ||
    trimOptionalString(storefront.logoUrl)
  );
}

function resolveMetadataBase() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    null;

  if (!baseUrl) {
    return undefined;
  }

  try {
    return new URL(baseUrl);
  } catch {
    return undefined;
  }
}

export function buildStoreMetadata({
  storefront,
  pageTitle,
  description,
  fallbackDescription,
  keywords,
  ogImageUrl,
}: BuildStoreMetadataOptions): Metadata {
  const title = buildMetadataTitle(storefront, pageTitle);
  const resolvedDescription = buildMetadataDescription(
    storefront,
    description,
    fallbackDescription,
  );
  const resolvedKeywords = buildMetadataKeywords(
    keywords,
    storefront.seoKeywords,
  );
  const resolvedImage = resolveMetadataImage(storefront, ogImageUrl);
  const metadataBase = resolveMetadataBase();

  return {
    metadataBase,
    title,
    description: resolvedDescription,
    keywords: resolvedKeywords,
    robots: {
      index: storefront.allowIndexing,
      follow: storefront.allowIndexing,
    },
    openGraph: {
      title,
      description: resolvedDescription,
      images: resolvedImage ? [{ url: resolvedImage }] : undefined,
      type: "website",
    },
    twitter: {
      card: resolvedImage ? "summary_large_image" : "summary",
      title,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

export function buildStoreStructuredData(storefront: StorefrontSettingsDto) {
  const description = buildMetadataDescription(storefront);
  const logoUrl = trimOptionalString(storefront.logoUrl);
  const ogImageUrl = resolveMetadataImage(storefront);
  const contactEmail = trimOptionalString(storefront.contactEmail);
  const supportPhone = trimOptionalString(storefront.supportPhone);
  const siteUrl = resolveMetadataBase()?.toString();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name:
      trimOptionalString(storefront.siteName) ||
      DEFAULT_STOREFRONT_SETTINGS.siteName,
    description,
    url: siteUrl,
    email: contactEmail ?? undefined,
    telephone: supportPhone ?? undefined,
    image: ogImageUrl ?? undefined,
    publisher: {
      "@type": "Organization",
      name:
        trimOptionalString(storefront.siteName) ||
        DEFAULT_STOREFRONT_SETTINGS.siteName,
      logo: logoUrl
        ? {
            "@type": "ImageObject",
            url: logoUrl,
          }
        : undefined,
      email: contactEmail ?? undefined,
      telephone: supportPhone ?? undefined,
    },
  };
}
