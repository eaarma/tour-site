const DEFAULT_CONTACT_EMAIL = process.env.NEXT_PUBLIC_SITE_EMAIL?.trim() || null;

export type StorefrontBasePreset =
  | "SLATE"
  | "DARK"
  | "CONTRAST"
  | "WARM"
  | "LUXURY"
  | "MODERN"
  | "NATURE"
  | "OCEAN"
  | "PLAYFUL"
  | "PASTEL"
  | "SUNSET"
  | "MINIMAL";

export interface StorefrontSettingsDto {
  id: number | null;
  siteName: string;
  contactEmail: string | null;
  contactReceiverEmail: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  allowIndexing: boolean;
  logoUrl: string | null;
  faviconUrl: string | null;
  basePreset: StorefrontBasePreset;
  primaryColor: string;
  accentColor: string;
  supportPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  businessHours: string | null;
  showContactEmail: boolean;
  showSupportPhone: boolean;
  showAddress: boolean;
  showBusinessHours: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateStorefrontSettingsRequestDto {
  siteName: string;
  contactEmail: string | null;
  contactReceiverEmail: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  allowIndexing: boolean;
  logoUrl: string | null;
  faviconUrl: string | null;
  basePreset: StorefrontBasePreset;
  primaryColor: string;
  accentColor: string;
  supportPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  businessHours: string | null;
  showContactEmail: boolean;
  showSupportPhone: boolean;
  showAddress: boolean;
  showBusinessHours: boolean;
}

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettingsDto = {
  id: null,
  siteName: "TourHub",
  contactEmail: DEFAULT_CONTACT_EMAIL,
  contactReceiverEmail: null,
  seoTitle: null,
  seoDescription: "Explore and Book Amazing Tours",
  seoKeywords: null,
  ogImageUrl: null,
  allowIndexing: true,
  logoUrl: "/tree.png",
  faviconUrl: null,
  basePreset: "SLATE",
  primaryColor: "#0284c7",
  accentColor: "#f59e0b",
  supportPhone: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  postalCode: null,
  country: null,
  businessHours: null,
  showContactEmail: true,
  showSupportPhone: true,
  showAddress: true,
  showBusinessHours: true,
  createdAt: null,
  updatedAt: null,
};
