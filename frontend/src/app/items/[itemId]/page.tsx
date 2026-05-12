import type { Metadata } from "next";

import ItemPageClient from "@/components/items/ItemPageClient";
import { getItemPageServerData } from "@/lib/items/getItemPageServerData";
import { getPublicStorefrontOrFallback } from "@/lib/storefront/publicStorefront";
import { resolveMetadataImage } from "@/lib/storefront/storeSeo";

type Props = {
  params: Promise<{
    itemId: string;
  }>;
};

function truncateDescription(value?: string | null, maxLength = 160) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "Explore this guided tour and book your preferred time.";
  }

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength - 1).trim()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { itemId } = await params;

  try {
    const [{ item }, storefront] = await Promise.all([
      getItemPageServerData(itemId),
      getPublicStorefrontOrFallback(),
    ]);

    const title = `${item.title} | ${storefront.siteName}`;
    const description = truncateDescription(item.description);
    const image =
      item.images?.[0] || resolveMetadataImage(storefront) || undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {
      title: "Tour not found",
    };
  }
}

export default async function ItemPage({ params }: Props) {
  const { itemId } = await params;
  const initialData = await getItemPageServerData(itemId);

  return <ItemPageClient initialData={initialData} />;
}
