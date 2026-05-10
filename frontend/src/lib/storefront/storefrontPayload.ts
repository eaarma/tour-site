import {
  DEFAULT_STOREFRONT_SETTINGS,
  type StorefrontSettingsDto,
  type UpdateStorefrontSettingsRequestDto,
} from "@/types/storefront";

export function buildStorefrontUpdatePayload(
  settings?: Partial<StorefrontSettingsDto> | null,
  overrides?: Partial<UpdateStorefrontSettingsRequestDto>,
): UpdateStorefrontSettingsRequestDto {
  const source = {
    ...DEFAULT_STOREFRONT_SETTINGS,
    ...settings,
  };

  return {
    siteName: source.siteName,
    contactEmail: source.contactEmail,
    contactReceiverEmail: source.contactReceiverEmail,
    seoTitle: source.seoTitle,
    seoDescription: source.seoDescription,
    seoKeywords: source.seoKeywords,
    ogImageUrl: source.ogImageUrl,
    allowIndexing: source.allowIndexing,
    logoUrl: source.logoUrl,
    faviconUrl: source.faviconUrl,
    basePreset: source.basePreset,
    primaryColor: source.primaryColor,
    accentColor: source.accentColor,
    supportPhone: source.supportPhone,
    addressLine1: source.addressLine1,
    addressLine2: source.addressLine2,
    city: source.city,
    postalCode: source.postalCode,
    country: source.country,
    businessHours: source.businessHours,
    showContactEmail: source.showContactEmail,
    showSupportPhone: source.showSupportPhone,
    showAddress: source.showAddress,
    showBusinessHours: source.showBusinessHours,
    ...overrides,
  };
}
