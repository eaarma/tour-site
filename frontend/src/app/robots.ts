import type { MetadataRoute } from "next";

import { getPublicStorefrontOrFallback } from "@/lib/storefront/publicStorefront";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const storefront = await getPublicStorefrontOrFallback();

  if (!storefront.allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
}

