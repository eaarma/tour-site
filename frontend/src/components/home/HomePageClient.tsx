"use client";

import Link from "next/link";
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
import TourCollectionGrid from "@/components/home/TourCollectionGrid";
import WelcomeImage from "@/components/home/WelcomeImage";
import type { HomepageConfigFields, HomepageValueIconKey } from "@/types";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/types/homepage";
import { HomepageServerData } from "@/lib/home/getHomepageServerData";

const HOME_VALUE_ICONS = {
  COMPASS: Compass,
  USERS: Users,
  SHIELD_CHECK: ShieldCheck,
  TIMER_RESET: TimerReset,
} as const;

type Props = {
  initialData: HomepageServerData;
};

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

export default function HomePageClient({ initialData }: Props) {
  const { homepageConfig, items, highlighted, collectionItems } = initialData;

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
      <main className="flex flex-col gap-12 pb-8 pt-0 sm:mt-8 sm:gap-14">
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

        {hasFeatured ? (
          <ItemListHorizontal
            title={homepageConfig.featuredTitle || "Featured tours"}
            items={items}
          />
        ) : null}

        {homepageConfig.highlightedEnabled ||
        homepageConfig.collectionEnabled ? (
          <div>
            {highlighted && hasCollection ? (
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
        ) : null}

        {homepageConfig.aboutEnabled ? (
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
        ) : null}

        {homepageConfig.ctaEnabled ? (
          <HomeCtaSection
            title={homepageConfig.ctaTitle}
            description={homepageConfig.ctaDescription}
          />
        ) : null}
      </main>
    </div>
  );
}
