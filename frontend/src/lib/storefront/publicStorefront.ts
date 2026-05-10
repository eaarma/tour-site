import { getApiBaseUrl } from "@/lib/api/baseUrl";
import {
  normalizeHexColor,
  normalizeStorefrontBasePreset,
} from "@/lib/storefront/storefrontTheme";
import {
  DEFAULT_STOREFRONT_SETTINGS,
  type StorefrontSettingsDto,
} from "@/types/storefront";

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

export async function getPublicStorefront(): Promise<StorefrontSettingsDto> {
  const response = await fetch(new URL("/storefront", getApiBaseUrl()), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw createRequestError(
      "Failed to load storefront settings",
      response.status,
    );
  }

  return response.json();
}

export async function getPublicStorefrontOrFallback(): Promise<StorefrontSettingsDto> {
  try {
    const storefront = await getPublicStorefront();

    return {
      ...DEFAULT_STOREFRONT_SETTINGS,
      ...storefront,
      siteName:
        storefront.siteName?.trim() || DEFAULT_STOREFRONT_SETTINGS.siteName,
      logoUrl:
        storefront.logoUrl?.trim() || DEFAULT_STOREFRONT_SETTINGS.logoUrl,
      contactEmail: storefront.contactEmail?.trim() || null,
      contactReceiverEmail: storefront.contactReceiverEmail?.trim() || null,
      seoTitle: storefront.seoTitle?.trim() || null,
      seoDescription:
        storefront.seoDescription?.trim() ||
        DEFAULT_STOREFRONT_SETTINGS.seoDescription,
      seoKeywords: storefront.seoKeywords?.trim() || null,
      ogImageUrl: storefront.ogImageUrl?.trim() || null,
      allowIndexing:
        storefront.allowIndexing ?? DEFAULT_STOREFRONT_SETTINGS.allowIndexing,
      faviconUrl: storefront.faviconUrl?.trim() || null,
      basePreset: normalizeStorefrontBasePreset(storefront.basePreset),
      primaryColor: normalizeHexColor(
        storefront.primaryColor,
        DEFAULT_STOREFRONT_SETTINGS.primaryColor,
      ),
      accentColor: normalizeHexColor(
        storefront.accentColor,
        DEFAULT_STOREFRONT_SETTINGS.accentColor,
      ),
      supportPhone: storefront.supportPhone?.trim() || null,
      addressLine1: storefront.addressLine1?.trim() || null,
      addressLine2: storefront.addressLine2?.trim() || null,
      city: storefront.city?.trim() || null,
      postalCode: storefront.postalCode?.trim() || null,
      country: storefront.country?.trim() || null,
      businessHours: storefront.businessHours?.trim() || null,
      showContactEmail:
        storefront.showContactEmail ??
        DEFAULT_STOREFRONT_SETTINGS.showContactEmail,
      showSupportPhone:
        storefront.showSupportPhone ??
        DEFAULT_STOREFRONT_SETTINGS.showSupportPhone,
      showAddress:
        storefront.showAddress ?? DEFAULT_STOREFRONT_SETTINGS.showAddress,
      showBusinessHours:
        storefront.showBusinessHours ??
        DEFAULT_STOREFRONT_SETTINGS.showBusinessHours,
    };
  } catch {
    return DEFAULT_STOREFRONT_SETTINGS;
  }
}

