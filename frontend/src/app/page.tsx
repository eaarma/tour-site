"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  TimerReset,
  Users,
} from "lucide-react";

import SearchBar from "@/components/common/SearchBar";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import HomeSectionHeading from "@/components/home/HomeSectionHeading";
import HomeValueCard from "@/components/home/HomeValueCard";
import HighlightedItem from "@/components/home/HighlightedItem";
import ItemListHorizontal from "@/components/home/ItemListHorizontal";
import ItemListHorizontalSkeleton from "@/components/home/ItemListHorizontalSkeleton";
import HighlightedItemSkeleton from "@/components/home/HighlightedItemSkeleton";
import TourCollectionGrid, {
  type TourCollectionShowcaseItem,
} from "@/components/home/TourCollectionGrid";
import WelcomeImage from "@/components/home/WelcomeImage";
import { HomepageConfigService } from "@/lib/storefront/homepageConfigService";
import { TourService } from "@/lib/tours/tourService";
import type {
  HomepageCollectionBlockDto,
  HomepageConfigDto,
  HomepageConfigFields,
  HomepageValueIconKey,
  Tour,
  TourCategory,
} from "@/types";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  normalizeHomepageConfig,
} from "@/types/homepage";

const HOME_VALUE_ICONS = {
  COMPASS: Compass,
  USERS: Users,
  SHIELD_CHECK: ShieldCheck,
  TIMER_RESET: TimerReset,
} as const;

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

function buildHeroTextColor(config: HomepageConfigFields) {
  switch (config.heroTextColorMode) {
    case "DARK":
      return "#0f172a";
    case "CUSTOM":
      return config.heroCustomTextColor?.trim() || "#ffffff";
    default:
      return "#ffffff";
  }
}

function isDarkHexColor(value: string | null) {
  const normalizedValue = value?.trim() ?? "";

  if (!/^#(?:[0-9a-f]{6})$/i.test(normalizedValue)) {
    return false;
  }

  const red = Number.parseInt(normalizedValue.slice(1, 3), 16);
  const green = Number.parseInt(normalizedValue.slice(3, 5), 16);
  const blue = Number.parseInt(normalizedValue.slice(5, 7), 16);
  const perceivedBrightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return perceivedBrightness < 150;
}

function buildHeroOverlayColor(config: HomepageConfigFields) {
  if (config.heroTextColorMode === "DARK") {
    return "255, 255, 255";
  }

  if (
    config.heroTextColorMode === "CUSTOM" &&
    isDarkHexColor(config.heroCustomTextColor)
  ) {
    return "255, 255, 255";
  }

  return "15, 23, 42";
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

  const results = await Promise.allSettled(
    Array.from(new Set(tourIds)).map((tourId) => TourService.getById(tourId)),
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
    return await TourService.getRandom(config.featuredMaxItems);
  } catch (error) {
    console.error("Failed to resolve featured tours:", error);
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
    return await TourService.getHighlighted();
  } catch (error) {
    console.warn("No highlighted tour available for homepage:", error);
    return null;
  }
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
          const tours = await TourService.getRandomByCategory(
            block.category,
            1,
          );
          categoryTour = tours[0] ?? null;
        } catch (error) {
          console.error(
            `Failed to fetch collection tour for ${block.category}:`,
            error,
          );
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

function buildCollectionItem(
  block: HomepageCollectionBlockDto,
  representativeTour: Tour | null,
  index: number,
  isSpecificTour: boolean,
): TourCollectionShowcaseItem | null {
  const categoryLink = block.category
    ? `/items?category=${block.category}`
    : "/items";
  const title = block.title?.trim() || `Collection ${index + 1}`;
  const eyebrow = block.badge?.trim() || "Explore";
  const description = block.description?.trim() || undefined;

  return {
    title,
    eyebrow,
    description,
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

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfigDto>(
    DEFAULT_HOMEPAGE_CONFIG,
  );
  const [items, setItems] = useState<Tour[]>([]);
  const [highlighted, setHighlighted] = useState<Tour | null>(null);
  const [collectionItems, setCollectionItems] = useState<
    TourCollectionShowcaseItem[]
  >([]);

  useEffect(() => {
    let active = true;

    const fetchHomepageData = async () => {
      try {
        let nextHomepageConfig = DEFAULT_HOMEPAGE_CONFIG;

        try {
          nextHomepageConfig = normalizeHomepageConfig(
            await HomepageConfigService.get(),
          );
        } catch (homepageConfigError) {
          console.error(
            "Failed to load homepage config, falling back to defaults:",
            homepageConfigError,
          );
        }

        if (!active) {
          return;
        }

        setHomepageConfig(nextHomepageConfig);

        const [featuredTours, highlightedTour, fallbackTours] =
          await Promise.all([
            resolveFeaturedTours(nextHomepageConfig),
            resolveHighlightedTour(nextHomepageConfig),
            TourService.getRandom(
              Math.max(8, nextHomepageConfig.featuredMaxItems),
            )
              .then((tours) => dedupeTours(tours))
              .catch((error) => {
                console.error(
                  "Failed to fetch homepage fallback tours:",
                  error,
                );
                return [] as Tour[];
              }),
          ]);

        const nextCollectionItems = await resolveCollectionItems(
          nextHomepageConfig,
          dedupeTours([
            ...fallbackTours,
            ...(highlightedTour ? [highlightedTour] : []),
            ...featuredTours,
          ]),
        );

        if (!active) {
          return;
        }

        setItems(featuredTours);
        setHighlighted(highlightedTour);
        setCollectionItems(nextCollectionItems);
      } catch (error) {
        console.error("Failed to fetch home page content:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchHomepageData();

    return () => {
      active = false;
    };
  }, []);

  const heroTextColor = buildHeroTextColor(homepageConfig);
  const heroOverlayColor = buildHeroOverlayColor(homepageConfig);
  const heroSubtitleStyle = {
    color: heroTextColor,
    opacity: homepageConfig.heroTextColorMode === "DARK" ? 0.84 : 0.88,
  };
  const hasHero = homepageConfig.heroEnabled;
  const hasFeatured = homepageConfig.featuredEnabled && items.length > 0;
  const hasCollection =
    homepageConfig.collectionEnabled && collectionItems.length > 0;
  const valueCards = homepageConfig.valueCards
    .map((card) => ({
      ...card,
      icon: HOME_VALUE_ICONS[card.iconKey as HomepageValueIconKey] ?? Compass,
    }))
    .filter((card) => card.title && card.description);

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <main className="flex flex-col gap-12 pb-8 pt-0 sm:gap-14 sm:mt-8">
        <div className="px-2 sm:px-4 md:px-0">
          {hasHero ? (
            <WelcomeImage
              imageUrl={
                homepageConfig.heroImageUrl ||
                DEFAULT_HOMEPAGE_CONFIG.heroImageUrl ||
                "/images/welcome_image.png"
              }
              contentPosition={homepageConfig.heroContentPosition}
              overlayStrength={homepageConfig.heroOverlayStrength}
              overlayColor={heroOverlayColor}
              floatingContent={<SearchBar redirectOnSearch />}
            >
              <div className="flex max-w-[min(100%,44rem)] flex-col gap-4 rounded-xl p-1 sm:gap-5 sm:p-2">
                <div className="max-w-2xl space-y-3">
                  <h1
                    className="text-2xl font-semibold leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(15,23,42,0.36)] sm:text-4xl"
                    style={{ color: heroTextColor }}
                  >
                    {homepageConfig.heroTitle}
                  </h1>
                  <p
                    className="text-sm leading-6 drop-shadow-[0_2px_12px_rgba(15,23,42,0.28)] sm:text-lg sm:leading-7"
                    style={heroSubtitleStyle}
                  >
                    {homepageConfig.heroSubtitle}
                  </p>
                </div>

                <div className="flex justify-center pt-1 sm:justify-start">
                  <Link
                    href={homepageConfig.heroButtonLink || "/items"}
                    className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/96 px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-[0_14px_35px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-white hover:text-primary sm:px-5 sm:py-3 sm:text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full bg-primary"
                    />
                    {homepageConfig.heroButtonText}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </WelcomeImage>
          ) : (
            <section className="rounded-[30px] border border-base-300 bg-gradient-to-br from-base-100 via-base-200/50 to-base-100 px-4 py-5 shadow-sm sm:px-6 sm:py-6">
              <div className="mb-4 max-w-2xl">
                <h1 className="text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
                  Search tours your way
                </h1>
                <p className="mt-2 text-sm leading-6 text-base-content/70 sm:text-base">
                  The homepage hero is hidden right now, so search stays
                  available here instead.
                </p>
              </div>
              <SearchBar redirectOnSearch />
            </section>
          )}
        </div>

        {homepageConfig.featuredEnabled ? (
          <div>
            {loading ? (
              <ItemListHorizontalSkeleton />
            ) : hasFeatured ? (
              <ItemListHorizontal
                title={homepageConfig.featuredTitle || "Featured tours"}
                items={items}
              />
            ) : null}
          </div>
        ) : null}

        {homepageConfig.highlightedEnabled ||
        homepageConfig.collectionEnabled ? (
          <div>
            {loading ? (
              <HighlightedItemSkeleton />
            ) : highlighted && hasCollection ? (
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <HighlightedItem
                  title={homepageConfig.highlightedTitle || "Tour spotlight"}
                  item={highlighted}
                />
                <TourCollectionGrid
                  title={homepageConfig.collectionTitle || "Explore by style"}
                  items={collectionItems}
                />
              </div>
            ) : highlighted ? (
              <HighlightedItem
                title={homepageConfig.highlightedTitle || "Tour spotlight"}
                item={highlighted}
              />
            ) : hasCollection ? (
              <TourCollectionGrid
                title={homepageConfig.collectionTitle || "Explore by style"}
                items={collectionItems}
              />
            ) : null}
          </div>
        ) : null}

        {homepageConfig.valueSectionEnabled && valueCards.length > 0 ? (
          <div>
            <section className="space-y-10">
              <HomeSectionHeading
                eyebrow={homepageConfig.valueEyebrow || undefined}
                title={homepageConfig.valueTitle || "Why book here"}
                description={homepageConfig.valueDescription || undefined}
              />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {valueCards.map((valueCard) => (
                  <HomeValueCard
                    key={`${valueCard.title}-${valueCard.iconKey}`}
                    icon={valueCard.icon}
                    title={valueCard.title ?? ""}
                    description={valueCard.description ?? ""}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {homepageConfig.aboutEnabled ? (
          <div>
            <section className="rounded-[30px] border border-base-300 bg-gradient-to-br from-base-100 via-base-200/45 to-base-100 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <HomeSectionHeading
                  eyebrow={homepageConfig.aboutEyebrow || undefined}
                  title={homepageConfig.aboutTitle || "About the platform"}
                  description={homepageConfig.aboutDescription || undefined}
                />

                <div>
                  <Link
                    href="/items"
                    className="btn btn-outline rounded-full px-6"
                  >
                    {homepageConfig.aboutButtonText || "Explore tours"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {homepageConfig.ctaEnabled ? (
          <div>
            <HomeCtaSection
              title={homepageConfig.ctaTitle}
              description={homepageConfig.ctaDescription}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}

