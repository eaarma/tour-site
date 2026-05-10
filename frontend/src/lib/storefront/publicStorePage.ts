import { getApiBaseUrl } from "@/lib/api/baseUrl";
import {
  DEFAULT_STORE_PAGES,
  normalizeStorePage,
} from "@/lib/storefront/storePageDefaults";
import type {
  StorePageContentBySlug,
  StorePageDto,
  StorePageSlug,
} from "@/types/storePage";

type ApiRequestError = Error & {
  status: number;
};

const createRequestError = (
  message: string,
  status: number,
): ApiRequestError => {
  const error = new Error(`${message}: ${status}`) as ApiRequestError;
  error.status = status;
  return error;
};

export async function getPublicStorePage<TSlug extends StorePageSlug>(
  slug: TSlug,
): Promise<StorePageDto<StorePageContentBySlug[TSlug]>> {
  const response = await fetch(
    new URL(`/storefront/pages/${slug}`, getApiBaseUrl()),
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw createRequestError("Failed to load store page", response.status);
  }

  return normalizeStorePage(
    slug,
    (await response.json()) as StorePageDto<StorePageContentBySlug[TSlug]>,
  );
}

export async function getPublicStorePageOrFallback<TSlug extends StorePageSlug>(
  slug: TSlug,
): Promise<StorePageDto<StorePageContentBySlug[TSlug]>> {
  try {
    return await getPublicStorePage(slug);
  } catch {
    return DEFAULT_STORE_PAGES[slug];
  }
}

