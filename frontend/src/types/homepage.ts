import type { TourCategory } from "./tour";

export type HomepageHeroContentPosition = "LEFT" | "CENTER" | "RIGHT";

export type HomepageHeroTextColorMode = "AUTO" | "LIGHT" | "DARK" | "CUSTOM";

export type HomepageSelectionMode = "RANDOM" | "MANUAL";

export type HomepageValueIconKey =
  | "COMPASS"
  | "USERS"
  | "SHIELD_CHECK"
  | "TIMER_RESET";

export type HomepageCollectionBlockDto = {
  badge: string | null;
  title: string | null;
  description: string | null;
  category: TourCategory | null;
  tourId: number | null;
};

export type HomepageValueCardDto = {
  title: string | null;
  description: string | null;
  iconKey: HomepageValueIconKey;
};

export type HomepageConfigFields = {
  heroEnabled: boolean;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroButtonText: string | null;
  heroButtonLink: string | null;
  heroContentPosition: HomepageHeroContentPosition;
  heroImageUrl: string | null;
  heroTextColorMode: HomepageHeroTextColorMode;
  heroCustomTextColor: string | null;
  heroOverlayStrength: number;
  featuredEnabled: boolean;
  featuredTitle: string | null;
  featuredSelectionMode: HomepageSelectionMode;
  featuredTourIds: number[];
  featuredMaxItems: number;
  highlightedEnabled: boolean;
  highlightedTitle: string | null;
  highlightedSelectionMode: HomepageSelectionMode;
  highlightedTourIds: number[];
  collectionEnabled: boolean;
  collectionTitle: string | null;
  collectionBlocks: HomepageCollectionBlockDto[];
  valueSectionEnabled: boolean;
  valueEyebrow: string | null;
  valueTitle: string | null;
  valueDescription: string | null;
  valueCards: HomepageValueCardDto[];
  aboutEnabled: boolean;
  aboutEyebrow: string | null;
  aboutTitle: string | null;
  aboutDescription: string | null;
  aboutButtonText: string | null;
  ctaEnabled: boolean;
  ctaTitle: string | null;
  ctaDescription: string | null;
};

export type HomepageConfigDto = HomepageConfigFields & {
  id: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UpdateHomepageConfigRequestDto = HomepageConfigFields;

export const DEFAULT_HOMEPAGE_COLLECTION_BLOCKS: HomepageCollectionBlockDto[] = [
  {
    badge: "City pace",
    title: "Walking routes",
    description:
      "Shorter-format experiences for exploring neighborhoods, landmarks, and local stories on foot.",
    category: "WALKING",
    tourId: null,
  },
  {
    badge: "Nature focus",
    title: "Outdoor escapes",
    description:
      "Trails, scenic routes, and fresh-air experiences built for travelers who want room to roam.",
    category: "HIKING",
    tourId: null,
  },
  {
    badge: "Stories first",
    title: "Culture trails",
    description:
      "History, art, and local context grouped into tours made for slower, more thoughtful discovery.",
    category: "CULTURE",
    tourId: null,
  },
  {
    badge: "Social energy",
    title: "Food and evening picks",
    description:
      "Browse tours that lean into tastings, nightlife, and memorable shared moments after the daytime rush.",
    category: "FOOD",
    tourId: null,
  },
];

export const DEFAULT_HOMEPAGE_VALUE_CARDS: HomepageValueCardDto[] = [
  {
    title: "Curated routes",
    description:
      "Compare city walks, nature outings, and themed experiences from one place instead of juggling separate listings.",
    iconKey: "COMPASS",
  },
  {
    title: "Flexible group options",
    description:
      "Public and private formats sit side by side so it is easier to choose the right pace and group size.",
    iconKey: "USERS",
  },
  {
    title: "Straightforward booking",
    description:
      "Search by date, review the essentials quickly, and move into booking without extra friction.",
    iconKey: "SHIELD_CHECK",
  },
  {
    title: "Useful details upfront",
    description:
      "Duration, intensity, languages, and meeting context stay visible while you browse and compare.",
    iconKey: "TIMER_RESET",
  },
];

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfigDto = {
  id: null,
  heroEnabled: true,
  heroTitle: "Find your adventure",
  heroSubtitle:
    "Guided tours shaped for easier browsing, clearer details, and faster decisions",
  heroButtonText: "Browse all tours",
  heroButtonLink: "/items",
  heroContentPosition: "LEFT",
  heroImageUrl: "/images/welcome_image.png",
  heroTextColorMode: "AUTO",
  heroCustomTextColor: null,
  heroOverlayStrength: 42,
  featuredEnabled: true,
  featuredTitle: "Featured tours",
  featuredSelectionMode: "RANDOM",
  featuredTourIds: [],
  featuredMaxItems: 8,
  highlightedEnabled: true,
  highlightedTitle: "Tour spotlight",
  highlightedSelectionMode: "RANDOM",
  highlightedTourIds: [],
  collectionEnabled: true,
  collectionTitle: "Explore by style",
  collectionBlocks: DEFAULT_HOMEPAGE_COLLECTION_BLOCKS,
  valueSectionEnabled: true,
  valueEyebrow: "Why book here",
  valueTitle:
    "A homepage built to make comparing tours feel quicker and more considered",
  valueDescription:
    "The homepage is designed to surface the details that matter early, so it is easier to compare routes, pacing, group format, and booking fit before you commit.",
  valueCards: DEFAULT_HOMEPAGE_VALUE_CARDS,
  aboutEnabled: true,
  aboutEyebrow: "About the platform",
  aboutTitle: "Tour discovery designed to feel clearer from the first click",
  aboutDescription:
    "From quick city walks to longer outdoor routes, the goal is to make it easier to understand each experience, compare options, and move into booking with confidence.",
  aboutButtonText: "Explore tours",
  ctaEnabled: true,
  ctaTitle: "Ready to find the right tour or ask a question before you book?",
  ctaDescription:
    "Keep browsing the tour catalog, or head to the contact page if you want help choosing a route, comparing options, or planning a trip.",
  createdAt: null,
  updatedAt: null,
};

const normalizeNullableString = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeTourIds = (tourIds: number[] | null | undefined) => {
  if (!Array.isArray(tourIds)) {
    return [];
  }

  return Array.from(
    new Set(
      tourIds.filter(
        (tourId): tourId is number =>
          Number.isInteger(tourId) && Number.isFinite(tourId) && tourId > 0,
      ),
    ),
  );
};

const normalizeCollectionBlocks = (
  blocks: HomepageCollectionBlockDto[] | null | undefined,
) =>
  DEFAULT_HOMEPAGE_COLLECTION_BLOCKS.map((defaultBlock, index) => {
    const nextBlock = blocks?.[index];

    return {
      badge: normalizeNullableString(nextBlock?.badge) ?? defaultBlock.badge,
      title: normalizeNullableString(nextBlock?.title) ?? defaultBlock.title,
      description:
        normalizeNullableString(nextBlock?.description) ??
        defaultBlock.description,
      category: nextBlock?.category ?? defaultBlock.category,
      tourId:
        typeof nextBlock?.tourId === "number" && nextBlock.tourId > 0
          ? nextBlock.tourId
          : null,
    };
  });

const normalizeValueCards = (
  cards: HomepageValueCardDto[] | null | undefined,
) =>
  DEFAULT_HOMEPAGE_VALUE_CARDS.map((defaultCard, index) => {
    const nextCard = cards?.[index];

    return {
      title: normalizeNullableString(nextCard?.title) ?? defaultCard.title,
      description:
        normalizeNullableString(nextCard?.description) ??
        defaultCard.description,
      iconKey: nextCard?.iconKey ?? defaultCard.iconKey,
    };
  });

export function normalizeHomepageConfig(
  config?: Partial<HomepageConfigDto> | null,
): HomepageConfigDto {
  return {
    ...DEFAULT_HOMEPAGE_CONFIG,
    ...config,
    heroTitle:
      normalizeNullableString(config?.heroTitle) ??
      DEFAULT_HOMEPAGE_CONFIG.heroTitle,
    heroSubtitle:
      normalizeNullableString(config?.heroSubtitle) ??
      DEFAULT_HOMEPAGE_CONFIG.heroSubtitle,
    heroButtonText:
      normalizeNullableString(config?.heroButtonText) ??
      DEFAULT_HOMEPAGE_CONFIG.heroButtonText,
    heroButtonLink:
      normalizeNullableString(config?.heroButtonLink) ??
      DEFAULT_HOMEPAGE_CONFIG.heroButtonLink,
    heroImageUrl:
      normalizeNullableString(config?.heroImageUrl) ??
      DEFAULT_HOMEPAGE_CONFIG.heroImageUrl,
    heroCustomTextColor: normalizeNullableString(config?.heroCustomTextColor),
    heroOverlayStrength: Math.min(
      100,
      Math.max(0, config?.heroOverlayStrength ?? 42),
    ),
    featuredTitle:
      normalizeNullableString(config?.featuredTitle) ??
      DEFAULT_HOMEPAGE_CONFIG.featuredTitle,
    featuredTourIds: normalizeTourIds(config?.featuredTourIds),
    featuredMaxItems: Math.min(
      24,
      Math.max(1, config?.featuredMaxItems ?? 8),
    ),
    highlightedTitle:
      normalizeNullableString(config?.highlightedTitle) ??
      DEFAULT_HOMEPAGE_CONFIG.highlightedTitle,
    highlightedTourIds: normalizeTourIds(config?.highlightedTourIds),
    collectionTitle:
      normalizeNullableString(config?.collectionTitle) ??
      DEFAULT_HOMEPAGE_CONFIG.collectionTitle,
    collectionBlocks: normalizeCollectionBlocks(config?.collectionBlocks),
    valueEyebrow:
      normalizeNullableString(config?.valueEyebrow) ??
      DEFAULT_HOMEPAGE_CONFIG.valueEyebrow,
    valueTitle:
      normalizeNullableString(config?.valueTitle) ??
      DEFAULT_HOMEPAGE_CONFIG.valueTitle,
    valueDescription:
      normalizeNullableString(config?.valueDescription) ??
      DEFAULT_HOMEPAGE_CONFIG.valueDescription,
    valueCards: normalizeValueCards(config?.valueCards),
    aboutEyebrow:
      normalizeNullableString(config?.aboutEyebrow) ??
      DEFAULT_HOMEPAGE_CONFIG.aboutEyebrow,
    aboutTitle:
      normalizeNullableString(config?.aboutTitle) ??
      DEFAULT_HOMEPAGE_CONFIG.aboutTitle,
    aboutDescription:
      normalizeNullableString(config?.aboutDescription) ??
      DEFAULT_HOMEPAGE_CONFIG.aboutDescription,
    aboutButtonText:
      normalizeNullableString(config?.aboutButtonText) ??
      DEFAULT_HOMEPAGE_CONFIG.aboutButtonText,
    ctaTitle:
      normalizeNullableString(config?.ctaTitle) ??
      DEFAULT_HOMEPAGE_CONFIG.ctaTitle,
    ctaDescription:
      normalizeNullableString(config?.ctaDescription) ??
      DEFAULT_HOMEPAGE_CONFIG.ctaDescription,
  };
}
