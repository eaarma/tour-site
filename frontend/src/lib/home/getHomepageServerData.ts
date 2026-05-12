import { serverFetch } from "@/lib/server/serverApi";

import type {
  HomepageCollectionBlockDto,
  HomepageConfigDto,
  HomepageConfigFields,
  Tour,
  TourCategory,
} from "@/types";

import {
  DEFAULT_HOMEPAGE_CONFIG,
  normalizeHomepageConfig,
} from "@/types/homepage";

import type { TourCollectionShowcaseItem } from "@/components/home/TourCollectionGrid";

function dedupeTours(tours: Tour[]) {
  const seenTourIds = new Set<number>();

  return tours.filter((tour) => {
    if (seenTourIds.has(tour.id)) {
      return false;
    }

    seenTourIds.add(tour.id);
    return true;
  });
}

function pickRandomTour(tours: Tour[]) {
  if (tours.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * tours.length);
  return tours[index] ?? null;
}

function getCollectionAccentClassName(
  category: TourCategory | null,
  index: number,
) {
  switch (category) {
    case "WALKING":
      return "bg-gradient-to-br from-sky-500/40 via-sky-900/70 to-slate-950/90";

    case "HIKING":
    case "NATURE":
      return "bg-gradient-to-br from-emerald-500/40 via-emerald-900/60 to-slate-950/90";

    case "CULTURE":
    case "HISTORY":
      return "bg-gradient-to-br from-amber-300/50 via-orange-700/70 to-slate-950/90";

    case "FOOD":
    case "NIGHTLIFE":
      return "bg-gradient-to-br from-rose-400/40 via-fuchsia-950/70 to-slate-950/90";

    default: {
      const fallbackAccents = [
        "bg-gradient-to-br from-sky-500/40 via-slate-900/70 to-slate-950/90",
        "bg-gradient-to-br from-emerald-500/40 via-slate-900/70 to-slate-950/90",
        "bg-gradient-to-br from-amber-300/50 via-slate-900/70 to-slate-950/90",
        "bg-gradient-to-br from-rose-400/40 via-slate-900/70 to-slate-950/90",
      ] as const;

      return fallbackAccents[index % fallbackAccents.length];
    }
  }
}

async function loadToursByIds(tourIds: number[]) {
  if (tourIds.length === 0) {
    return [];
  }

  const uniqueIds = Array.from(new Set(tourIds));

  const results = await Promise.allSettled(
    uniqueIds.map((tourId) => serverFetch<Tour>(`/tours/${tourId}`)),
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<Tour> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value)
    .filter((tour) => tour.status === "ACTIVE");
}

async function resolveFeaturedTours(config: HomepageConfigFields) {
  if (!config.featuredEnabled) {
    return [];
  }

  if (config.featuredSelectionMode === "MANUAL") {
    const selectedTours = await loadToursByIds(config.featuredTourIds);

    const selectedTourLookup = new Map(
      selectedTours.map((tour) => [tour.id, tour] as const),
    );

    return config.featuredTourIds
      .map((tourId) => selectedTourLookup.get(tourId) ?? null)
      .filter((tour): tour is Tour => tour !== null)
      .slice(0, config.featuredMaxItems);
  }

  try {
    return await serverFetch<Tour[]>(
      `/tours/random?count=${config.featuredMaxItems}`,
    );
  } catch {
    return [];
  }
}

async function resolveHighlightedTour(config: HomepageConfigFields) {
  if (!config.highlightedEnabled) {
    return null;
  }

  if (config.highlightedSelectionMode === "MANUAL") {
    const selectedTours = await loadToursByIds(config.highlightedTourIds);
    return pickRandomTour(selectedTours);
  }

  try {
    return await serverFetch<Tour>("/tours/highlighted");
  } catch {
    return null;
  }
}

function buildCollectionItem(
  block: HomepageCollectionBlockDto,
  representativeTour: Tour | null,
  index: number,
  isSpecificTour: boolean,
): TourCollectionShowcaseItem | null {
  const categoryLink = block.category
    ? `/items?category=${block.category}`
    : "/items";

  return {
    title: block.title?.trim() || `Collection ${index + 1}`,
    eyebrow: block.badge?.trim() || "Explore",
    description: block.description?.trim() || undefined,

    note: representativeTour
      ? `Featuring ${representativeTour.title}`
      : "Browse current tours in this style",

    href:
      representativeTour && isSpecificTour
        ? `/items/${representativeTour.id}`
        : categoryLink,

    imageUrl: representativeTour?.images?.[0] ?? null,

    accentClassName: getCollectionAccentClassName(block.category, index),
  };
}

async function resolveCollectionItems(
  config: HomepageConfigFields,
  fallbackTours: Tour[],
) {
  if (!config.collectionEnabled) {
    return [];
  }

  const items = await Promise.all(
    config.collectionBlocks.map(async (block, index) => {
      const specificTour =
        typeof block.tourId === "number" && block.tourId > 0
          ? ((await loadToursByIds([block.tourId]))[0] ?? null)
          : null;

      if (specificTour) {
        return buildCollectionItem(block, specificTour, index, true);
      }

      let categoryTour: Tour | null = null;

      if (block.category) {
        try {
          const tours = await serverFetch<Tour[]>(
            `/tours/random/category/${block.category}?count=1`,
          );

          categoryTour = tours[0] ?? null;
        } catch {
          categoryTour = null;
        }
      }

      const fallbackTour = fallbackTours[index] ?? fallbackTours[0] ?? null;

      return buildCollectionItem(
        block,
        categoryTour ?? fallbackTour,
        index,
        false,
      );
    }),
  );

  return items.filter(
    (item): item is TourCollectionShowcaseItem => item !== null,
  );
}

export async function getHomepageServerData() {
  let homepageConfig: HomepageConfigDto = DEFAULT_HOMEPAGE_CONFIG;

  try {
    const config = await serverFetch<HomepageConfigDto>("/storefront/homepage");

    homepageConfig = normalizeHomepageConfig(config);
  } catch {
    homepageConfig = DEFAULT_HOMEPAGE_CONFIG;
  }

  const [featuredTours, highlightedTour, fallbackTours] = await Promise.all([
    resolveFeaturedTours(homepageConfig),

    resolveHighlightedTour(homepageConfig),

    serverFetch<Tour[]>("/tours/random?count=12").catch(() => []),
  ]);

  const dedupedFallbackTours = dedupeTours([
    ...fallbackTours,
    ...(highlightedTour ? [highlightedTour] : []),
    ...featuredTours,
  ]);

  const collectionItems = await resolveCollectionItems(
    homepageConfig,
    dedupedFallbackTours,
  );

  return {
    homepageConfig,
    items: featuredTours,
    highlighted: highlightedTour,
    collectionItems,
  };
}

export type HomepageServerData = Awaited<
  ReturnType<typeof getHomepageServerData>
>;
