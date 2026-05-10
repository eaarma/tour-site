"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Compass,
  ImagePlus,
  Link2,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Upload,
  Users,
} from "lucide-react";

import { CATEGORY_OPTIONS } from "@/constants/categories";
import { HomepageConfigService } from "@/lib/storefront/homepageConfigService";
import { uploadStorefrontAsset } from "@/lib/storefront/storefrontAssetService";
import { TourService } from "@/lib/tours/tourService";
import type {
  HomepageCollectionBlockDto,
  HomepageConfigDto,
  HomepageConfigFields,
  HomepageHeroContentPosition,
  HomepageHeroTextColorMode,
  HomepageSelectionMode,
  HomepageValueCardDto,
  HomepageValueIconKey,
  Tour,
  TourCategory,
  UpdateHomepageConfigRequestDto,
} from "@/types";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  normalizeHomepageConfig,
} from "@/types/homepage";

import {
  formatStoreCustomizationDateTime,
  type StoreCustomizationTabProps,
} from "./storeCustomizationHeader";
import ColorField from "./components/ColorField";
import NumberField from "./components/NumberField";
import OptionCards from "./components/OptionCards";
import SectionCard from "./components/SectionCard";
import SelectField from "./components/SelectField";
import SummaryRow from "./components/SummaryRow";
import TextAreaField from "./components/TextAreaField";
import TextField from "./components/TextField";
import TourPicker from "./components/TourPicker";

type HomepageFieldErrors = Partial<
  Record<"heroButtonLink" | "heroCustomTextColor" | "featuredMaxItems", string>
>;

type TourLookup = Record<number, Tour>;

const HERO_LINK_PATTERN = /^(\/|https?:\/\/.+)/i;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{6})$/i;

const HERO_POSITION_OPTIONS: {
  value: HomepageHeroContentPosition;
  label: string;
}[] = [
  { value: "LEFT", label: "Left" },
  { value: "CENTER", label: "Center" },
  { value: "RIGHT", label: "Right" },
];

const HERO_TEXT_MODE_OPTIONS: {
  value: HomepageHeroTextColorMode;
  label: string;
  description: string;
}[] = [
  {
    value: "AUTO",
    label: "Auto",
    description: "Keep the current high-contrast white text treatment.",
  },
  {
    value: "LIGHT",
    label: "Light",
    description: "Force light hero copy over the image.",
  },
  {
    value: "DARK",
    label: "Dark",
    description: "Force darker hero copy for brighter imagery.",
  },
  {
    value: "CUSTOM",
    label: "Custom",
    description: "Use a specific hex color for hero copy.",
  },
];

const HOMEPAGE_SELECTION_MODE_OPTIONS: {
  value: HomepageSelectionMode;
  label: string;
  description: string;
}[] = [
  {
    value: "RANDOM",
    label: "Random",
    description: "Let the homepage pull from the live catalog automatically.",
  },
  {
    value: "MANUAL",
    label: "Manual",
    description: "Curate the exact tour pool by name or ID.",
  },
];

const VALUE_ICON_OPTIONS: {
  value: HomepageValueIconKey;
  label: string;
}[] = [
  { value: "COMPASS", label: "Compass" },
  { value: "USERS", label: "Users" },
  { value: "SHIELD_CHECK", label: "Shield check" },
  { value: "TIMER_RESET", label: "Timer reset" },
];

const HOME_VALUE_ICONS = {
  COMPASS: Compass,
  USERS: Users,
  SHIELD_CHECK: ShieldCheck,
  TIMER_RESET: TimerReset,
} as const;

const EMPTY_TOUR_LOOKUP: TourLookup = {};

const toHomepageForm = (
  config: HomepageConfigDto,
): UpdateHomepageConfigRequestDto => ({
  heroEnabled: config.heroEnabled,
  heroTitle: config.heroTitle,
  heroSubtitle: config.heroSubtitle,
  heroButtonText: config.heroButtonText,
  heroButtonLink: config.heroButtonLink,
  heroContentPosition: config.heroContentPosition,
  heroImageUrl: config.heroImageUrl,
  heroTextColorMode: config.heroTextColorMode,
  heroCustomTextColor: config.heroCustomTextColor,
  heroOverlayStrength: config.heroOverlayStrength,
  featuredEnabled: config.featuredEnabled,
  featuredTitle: config.featuredTitle,
  featuredSelectionMode: config.featuredSelectionMode,
  featuredTourIds: [...config.featuredTourIds],
  featuredMaxItems: config.featuredMaxItems,
  highlightedEnabled: config.highlightedEnabled,
  highlightedTitle: config.highlightedTitle,
  highlightedSelectionMode: config.highlightedSelectionMode,
  highlightedTourIds: [...config.highlightedTourIds],
  collectionEnabled: config.collectionEnabled,
  collectionTitle: config.collectionTitle,
  collectionBlocks: config.collectionBlocks.map((block) => ({ ...block })),
  valueSectionEnabled: config.valueSectionEnabled,
  valueEyebrow: config.valueEyebrow,
  valueTitle: config.valueTitle,
  valueDescription: config.valueDescription,
  valueCards: config.valueCards.map((card) => ({ ...card })),
  aboutEnabled: config.aboutEnabled,
  aboutEyebrow: config.aboutEyebrow,
  aboutTitle: config.aboutTitle,
  aboutDescription: config.aboutDescription,
  aboutButtonText: config.aboutButtonText,
  ctaEnabled: config.ctaEnabled,
  ctaTitle: config.ctaTitle,
  ctaDescription: config.ctaDescription,
});

const serializeForm = (form: HomepageConfigFields) => JSON.stringify(form);

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getCollectionAccentClassName = (
  category: TourCategory | null,
  index: number,
) => {
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
};

const getHeroTextPreviewColor = (form: HomepageConfigFields) => {
  switch (form.heroTextColorMode) {
    case "DARK":
      return "#0f172a";
    case "CUSTOM":
      return HEX_COLOR_PATTERN.test(form.heroCustomTextColor ?? "")
        ? (form.heroCustomTextColor ?? "#ffffff")
        : "#ffffff";
    default:
      return "#ffffff";
  }
};

const isDarkHexColor = (value: string | null) => {
  const normalizedValue = value?.trim() ?? "";

  if (!HEX_COLOR_PATTERN.test(normalizedValue)) {
    return false;
  }

  const red = Number.parseInt(normalizedValue.slice(1, 3), 16);
  const green = Number.parseInt(normalizedValue.slice(3, 5), 16);
  const blue = Number.parseInt(normalizedValue.slice(5, 7), 16);
  const perceivedBrightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return perceivedBrightness < 150;
};

const getHeroOverlayPreviewBackground = (form: HomepageConfigFields) => {
  const useLightOverlay =
    form.heroTextColorMode === "DARK" ||
    (form.heroTextColorMode === "CUSTOM" &&
      isDarkHexColor(form.heroCustomTextColor));

  return useLightOverlay
    ? "linear-gradient(140deg, rgba(255,255,255,0.82), rgba(255,255,255,0.34))"
    : "linear-gradient(140deg, rgba(15,23,42,0.72), rgba(15,23,42,0.28))";
};

const collectReferencedTourIds = (form: HomepageConfigFields) => {
  const ids = new Set<number>();

  form.featuredTourIds.forEach((tourId) => ids.add(tourId));
  form.highlightedTourIds.forEach((tourId) => ids.add(tourId));
  form.collectionBlocks.forEach((block) => {
    if (typeof block.tourId === "number" && block.tourId > 0) {
      ids.add(block.tourId);
    }
  });

  return Array.from(ids);
};

const validateHomepageForm = (
  form: HomepageConfigFields,
): HomepageFieldErrors => {
  const nextErrors: HomepageFieldErrors = {};

  if (
    form.heroButtonLink &&
    form.heroButtonLink.trim().length > 0 &&
    !HERO_LINK_PATTERN.test(form.heroButtonLink.trim())
  ) {
    nextErrors.heroButtonLink =
      "Use an absolute URL or a site-relative path like /items.";
  }

  if (form.heroTextColorMode === "CUSTOM") {
    if (!HEX_COLOR_PATTERN.test(form.heroCustomTextColor?.trim() ?? "")) {
      nextErrors.heroCustomTextColor = "Enter a valid 6-digit hex color.";
    }
  }

  if (
    !Number.isFinite(form.featuredMaxItems) ||
    form.featuredMaxItems < 1 ||
    form.featuredMaxItems > 24
  ) {
    nextErrors.featuredMaxItems = "Choose between 1 and 24 tours.";
  }

  return nextErrors;
};

export default function AdminStoreHomepageTab({
  onHeaderMetaChange,
}: StoreCustomizationTabProps) {
  const router = useRouter();
  const [config, setConfig] = useState<HomepageConfigDto | null>(null);
  const [form, setForm] = useState<HomepageConfigFields>(
    toHomepageForm(DEFAULT_HOMEPAGE_CONFIG),
  );
  const [initialForm, setInitialForm] = useState<HomepageConfigFields>(
    toHomepageForm(DEFAULT_HOMEPAGE_CONFIG),
  );
  const [tourLookup, setTourLookup] = useState<TourLookup>(EMPTY_TOUR_LOOKUP);
  const [fieldErrors, setFieldErrors] = useState<HomepageFieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewConfig = useMemo(
    () =>
      normalizeHomepageConfig({
        ...(config ?? {}),
        ...form,
      }),
    [config, form],
  );

  const hasChanges = useMemo(
    () => serializeForm(form) !== serializeForm(initialForm),
    [form, initialForm],
  );

  const hydrateTours = useCallback(async (tourIds: number[]) => {
    const uniqueIds = Array.from(new Set(tourIds)).filter(
      (tourId) => tourId > 0,
    );
    if (uniqueIds.length === 0) {
      return;
    }

    const results = await Promise.allSettled(
      uniqueIds.map((tourId) => TourService.getById(tourId)),
    );

    const nextTours = results
      .filter(
        (result): result is PromiseFulfilledResult<Tour> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    if (nextTours.length === 0) {
      return;
    }

    setTourLookup((currentLookup) => {
      const nextLookup = { ...currentLookup };

      nextTours.forEach((tour) => {
        nextLookup[tour.id] = tour;
      });

      return nextLookup;
    });
  }, []);

  const handleToursHydrated = useCallback((tours: Tour[]) => {
    if (tours.length === 0) {
      return;
    }

    setTourLookup((currentLookup) => {
      const nextLookup = { ...currentLookup };

      tours.forEach((tour) => {
        nextLookup[tour.id] = tour;
      });

      return nextLookup;
    });
  }, []);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextConfig = normalizeHomepageConfig(
        await HomepageConfigService.get(),
      );
      const nextForm = toHomepageForm(nextConfig);

      setConfig(nextConfig);
      setForm(nextForm);
      setInitialForm(nextForm);
      setFieldErrors({});
      await hydrateTours(collectReferencedTourIds(nextForm));
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load homepage settings.");
    } finally {
      setLoading(false);
    }
  }, [hydrateTours]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    onHeaderMetaChange?.({
      statusBadgeClassName: hasChanges
        ? "badge-warning badge-outline"
        : "badge-success badge-outline",
      statusBadgeLabel: hasChanges ? "Unsaved changes" : "Saved",
      lastUpdatedLabel: config?.updatedAt
        ? `Last updated ${formatStoreCustomizationDateTime(config.updatedAt)}`
        : config?.createdAt
          ? `Created ${formatStoreCustomizationDateTime(config.createdAt)}`
          : "Using default homepage settings",
    });
  }, [config?.createdAt, config?.updatedAt, hasChanges, onHeaderMetaChange]);

  const updateField = <K extends keyof HomepageConfigFields>(
    field: K,
    value: HomepageConfigFields[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setError(null);
    setFieldErrors({});
  };

  const updateCollectionBlock = (
    index: number,
    patch: Partial<HomepageCollectionBlockDto>,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      collectionBlocks: currentForm.collectionBlocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    }));
    setError(null);
  };

  const updateValueCard = (
    index: number,
    patch: Partial<HomepageValueCardDto>,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      valueCards: currentForm.valueCards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, ...patch } : card,
      ),
    }));
    setError(null);
  };

  const handleHeroImageUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    setUploadingHeroImage(true);
    setError(null);

    try {
      const uploadedAsset = await uploadStorefrontAsset({
        file,
        folder: "homepage-hero",
      });

      updateField("heroImageUrl", uploadedAsset.imageUrl);
      toast.success("Hero image uploaded.");
    } catch (uploadError) {
      console.error(uploadError);
      setError("Failed to upload the hero image.");
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      return;
    }

    const nextErrors = validateHomepageForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted homepage fields before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: UpdateHomepageConfigRequestDto = {
        ...form,
        featuredTourIds: Array.from(new Set(form.featuredTourIds)),
        highlightedTourIds: Array.from(new Set(form.highlightedTourIds)),
        featuredMaxItems: Math.min(24, Math.max(1, form.featuredMaxItems)),
      };

      const updatedConfig = normalizeHomepageConfig(
        await HomepageConfigService.update(payload),
      );
      const nextForm = toHomepageForm(updatedConfig);

      setConfig(updatedConfig);
      setForm(nextForm);
      setInitialForm(nextForm);
      setFieldErrors({});
      await hydrateTours(collectReferencedTourIds(nextForm));
      router.refresh();
      toast.success("Homepage settings updated.");
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to update homepage settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setFieldErrors({});
    setError(null);
  };

  const sectionStatuses = [
    { label: "Hero", enabled: form.heroEnabled },
    { label: "Featured", enabled: form.featuredEnabled },
    { label: "Spotlight", enabled: form.highlightedEnabled },
    { label: "Collection", enabled: form.collectionEnabled },
    { label: "Value section", enabled: form.valueSectionEnabled },
    { label: "About", enabled: form.aboutEnabled },
    { label: "CTA", enabled: form.ctaEnabled },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-10 m-4 text-sm text-base-content/60">
        Loading homepage settings...
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <SectionCard
          title="Hero section"
          description="Control the opening welcome image, the top copy, and the browse button destination."
          enabled={form.heroEnabled}
          onToggle={(checked) => updateField("heroEnabled", checked)}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-4">
              <TextField
                label="Title"
                value={form.heroTitle ?? ""}
                onChange={(value) => updateField("heroTitle", value)}
                placeholder="Find your adventure"
              />
              <TextAreaField
                label="Subtitle"
                value={form.heroSubtitle ?? ""}
                onChange={(value) => updateField("heroSubtitle", value)}
                placeholder="Guided tours shaped for easier browsing..."
                rows={4}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Button text"
                  value={form.heroButtonText ?? ""}
                  onChange={(value) => updateField("heroButtonText", value)}
                  placeholder="Browse all tours"
                />
                <TextField
                  label="Button link"
                  value={form.heroButtonLink ?? ""}
                  onChange={(value) => updateField("heroButtonLink", value)}
                  placeholder="/items"
                  error={fieldErrors.heroButtonLink}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Content position"
                  value={form.heroContentPosition}
                  onChange={(value) =>
                    updateField(
                      "heroContentPosition",
                      value as HomepageHeroContentPosition,
                    )
                  }
                  options={HERO_POSITION_OPTIONS}
                />
                <SelectField
                  label="Text color mode"
                  value={form.heroTextColorMode}
                  onChange={(value) =>
                    updateField(
                      "heroTextColorMode",
                      value as HomepageHeroTextColorMode,
                    )
                  }
                  options={HERO_TEXT_MODE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </div>

              {form.heroTextColorMode === "CUSTOM" ? (
                <ColorField
                  label="Custom hero text color"
                  description="Used for the hero title and subtitle."
                  value={form.heroCustomTextColor ?? ""}
                  fallbackColor="#ffffff"
                  error={fieldErrors.heroCustomTextColor}
                  onChange={(value) =>
                    updateField("heroCustomTextColor", value)
                  }
                />
              ) : null}

              <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-base-content">
                      Overlay strength
                    </p>
                    <p className="text-sm text-base-content/60">
                      Darken the image behind the hero copy for contrast.
                    </p>
                  </div>
                  <span className="badge badge-outline">
                    {form.heroOverlayStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.heroOverlayStrength}
                  className="range range-primary mt-4"
                  onChange={(event) =>
                    updateField(
                      "heroOverlayStrength",
                      Number(event.target.value),
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-base-content">
                      Welcome image
                    </p>
                    <p className="mt-1 text-sm text-base-content/60">
                      Paste an existing URL or upload a fresh image for the
                      hero.
                    </p>
                  </div>
                  <ImagePlus className="h-5 w-5 text-base-content/45" />
                </div>

                <div
                  className="mt-4 aspect-[16/10] overflow-hidden rounded-2xl border border-base-300 bg-base-300"
                  style={{
                    backgroundImage: form.heroImageUrl
                      ? `url(${form.heroImageUrl})`
                      : undefined,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                >
                  {!form.heroImageUrl ? (
                    <div className="flex h-full items-center justify-center text-sm text-base-content/55">
                      No image selected
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 space-y-3">
                  <TextField
                    label="Image URL"
                    value={form.heroImageUrl ?? ""}
                    onChange={(value) => updateField("heroImageUrl", value)}
                    placeholder="https://..."
                  />

                  <div className="flex flex-wrap gap-3">
                    <label className="btn btn-outline">
                      <Upload className="h-4 w-4" />
                      {uploadingHeroImage ? "Uploading..." : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingHeroImage}
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          event.currentTarget.value = "";
                          void handleHeroImageUpload(file);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => updateField("heroImageUrl", "")}
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Featured row"
          description="Set the horizontal list title and decide whether it fills itself or uses your curated tour list."
          enabled={form.featuredEnabled}
          onToggle={(checked) => updateField("featuredEnabled", checked)}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <TextField
                label="Section title"
                value={form.featuredTitle ?? ""}
                onChange={(value) => updateField("featuredTitle", value)}
                placeholder="Featured tours"
              />

              <NumberField
                label="Visible count"
                value={form.featuredMaxItems}
                onChange={(value) => updateField("featuredMaxItems", value)}
                min={1}
                max={24}
                error={fieldErrors.featuredMaxItems}
                description="Used when random content is pulled and when the manual list is trimmed for display."
              />

              <OptionCards
                label="Selection mode"
                options={HOMEPAGE_SELECTION_MODE_OPTIONS}
                value={form.featuredSelectionMode}
                onChange={(value) =>
                  updateField(
                    "featuredSelectionMode",
                    value as HomepageSelectionMode,
                  )
                }
              />
            </div>

            <TourPicker
              label="Featured tour list"
              description="Search by name or ID. When manual mode is active, this row displays the selected tours in the order shown below."
              selectedIds={form.featuredTourIds}
              onChange={(ids) => updateField("featuredTourIds", ids)}
              tourLookup={tourLookup}
              onToursHydrated={handleToursHydrated}
              allowMultiple
              allowReorder
              maxSelections={24}
              helperText={
                form.featuredSelectionMode === "RANDOM"
                  ? "Selections can stay here while you experiment with random mode. They will be used again if you switch back to manual."
                  : undefined
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Highlighted spotlight"
          description="Control the large spotlight card and optionally define the tour pool it can rotate through."
          enabled={form.highlightedEnabled}
          onToggle={(checked) => updateField("highlightedEnabled", checked)}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <TextField
                label="Section title"
                value={form.highlightedTitle ?? ""}
                onChange={(value) => updateField("highlightedTitle", value)}
                placeholder="Tour spotlight"
              />

              <OptionCards
                label="Selection mode"
                options={HOMEPAGE_SELECTION_MODE_OPTIONS}
                value={form.highlightedSelectionMode}
                onChange={(value) =>
                  updateField(
                    "highlightedSelectionMode",
                    value as HomepageSelectionMode,
                  )
                }
              />
            </div>

            <TourPicker
              label="Spotlight pool"
              description="Search by name or ID. In manual mode, the homepage picks one tour at random from this curated pool."
              selectedIds={form.highlightedTourIds}
              onChange={(ids) => updateField("highlightedTourIds", ids)}
              tourLookup={tourLookup}
              onToursHydrated={handleToursHydrated}
              allowMultiple
              allowReorder
              maxSelections={24}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Collection grid"
          description="Customize the four exploration cards. Each card can draw from a category or override with a specific tour."
          enabled={form.collectionEnabled}
          onToggle={(checked) => updateField("collectionEnabled", checked)}
        >
          <div className="space-y-4">
            <TextField
              label="Section title"
              value={form.collectionTitle ?? ""}
              onChange={(value) => updateField("collectionTitle", value)}
              placeholder="Explore by style"
            />

            <div className="grid gap-4 xl:grid-cols-2">
              {form.collectionBlocks.map((block, index) => (
                <div
                  key={`collection-block-${index}`}
                  className="rounded-2xl border border-base-300 bg-base-200/35 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-base-content">
                        Card {index + 1}
                      </p>
                      <p className="mt-1 text-sm text-base-content/60">
                        Badge, copy, category source, and an optional tour
                        override.
                      </p>
                    </div>
                    <div
                      className={`h-12 w-12 rounded-2xl border border-white/20 ${getCollectionAccentClassName(
                        block.category,
                        index,
                      )}`}
                    />
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextField
                        label="Badge"
                        value={block.badge ?? ""}
                        onChange={(value) =>
                          updateCollectionBlock(index, { badge: value })
                        }
                        placeholder="City pace"
                      />
                      <TextField
                        label="Title"
                        value={block.title ?? ""}
                        onChange={(value) =>
                          updateCollectionBlock(index, { title: value })
                        }
                        placeholder="Walking routes"
                      />
                    </div>

                    <TextAreaField
                      label="Description"
                      value={block.description ?? ""}
                      onChange={(value) =>
                        updateCollectionBlock(index, { description: value })
                      }
                      placeholder="Shorter-format experiences..."
                      rows={3}
                    />

                    <SelectField
                      label="Random category source"
                      value={block.category ?? ""}
                      onChange={(value) =>
                        updateCollectionBlock(index, {
                          category: value ? (value as TourCategory) : null,
                        })
                      }
                      options={[
                        { value: "", label: "No category selected" },
                        ...CATEGORY_OPTIONS.map((category) => ({
                          value: category,
                          label: formatEnumLabel(category),
                        })),
                      ]}
                    />

                    <TourPicker
                      label="Specific tour override"
                      description="Leave this empty to keep the random category behavior. If you pick a tour here, the card will use it instead."
                      selectedIds={
                        typeof block.tourId === "number" ? [block.tourId] : []
                      }
                      onChange={(ids) =>
                        updateCollectionBlock(index, {
                          tourId: ids[0] ?? null,
                        })
                      }
                      tourLookup={tourLookup}
                      onToursHydrated={handleToursHydrated}
                      allowMultiple={false}
                      maxSelections={1}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Value section"
          description="Edit the trust-building copy and the four cards under it."
          enabled={form.valueSectionEnabled}
          onToggle={(checked) => updateField("valueSectionEnabled", checked)}
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                label="Eyebrow"
                value={form.valueEyebrow ?? ""}
                onChange={(value) => updateField("valueEyebrow", value)}
                placeholder="Why book here"
              />
              <div className="md:col-span-2">
                <TextField
                  label="Title"
                  value={form.valueTitle ?? ""}
                  onChange={(value) => updateField("valueTitle", value)}
                  placeholder="A homepage built to make comparing tours..."
                />
              </div>
            </div>

            <TextAreaField
              label="Description"
              value={form.valueDescription ?? ""}
              onChange={(value) => updateField("valueDescription", value)}
              placeholder="The homepage is designed to surface..."
              rows={4}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              {form.valueCards.map((card, index) => {
                const Icon = HOME_VALUE_ICONS[card.iconKey];

                return (
                  <div
                    key={`value-card-${index}`}
                    className="rounded-2xl border border-base-300 bg-base-200/35 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-base-content">
                          Value card {index + 1}
                        </p>
                        <p className="mt-1 text-sm text-base-content/60">
                          Pick the icon and the supporting copy.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <SelectField
                        label="Icon"
                        value={card.iconKey}
                        onChange={(value) =>
                          updateValueCard(index, {
                            iconKey: value as HomepageValueIconKey,
                          })
                        }
                        options={VALUE_ICON_OPTIONS}
                      />

                      <TextField
                        label="Title"
                        value={card.title ?? ""}
                        onChange={(value) =>
                          updateValueCard(index, { title: value })
                        }
                        placeholder="Curated routes"
                      />

                      <TextAreaField
                        label="Description"
                        value={card.description ?? ""}
                        onChange={(value) =>
                          updateValueCard(index, { description: value })
                        }
                        placeholder="Compare city walks..."
                        rows={4}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="About section"
          description="Adjust the explanatory block above the final call to action."
          enabled={form.aboutEnabled}
          onToggle={(checked) => updateField("aboutEnabled", checked)}
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                label="Eyebrow"
                value={form.aboutEyebrow ?? ""}
                onChange={(value) => updateField("aboutEyebrow", value)}
                placeholder="About the platform"
              />
              <div className="md:col-span-2">
                <TextField
                  label="Title"
                  value={form.aboutTitle ?? ""}
                  onChange={(value) => updateField("aboutTitle", value)}
                  placeholder="Tour discovery designed..."
                />
              </div>
            </div>

            <TextAreaField
              label="Description"
              value={form.aboutDescription ?? ""}
              onChange={(value) => updateField("aboutDescription", value)}
              placeholder="From quick city walks..."
              rows={4}
            />

            <TextField
              label="Button text"
              value={form.aboutButtonText ?? ""}
              onChange={(value) => updateField("aboutButtonText", value)}
              placeholder="Explore tours"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Final CTA"
          description="Edit the closing headline and supporting copy at the bottom of the homepage."
          enabled={form.ctaEnabled}
          onToggle={(checked) => updateField("ctaEnabled", checked)}
        >
          <div className="space-y-4">
            <TextField
              label="Title"
              value={form.ctaTitle ?? ""}
              onChange={(value) => updateField("ctaTitle", value)}
              placeholder="Ready to find the right tour..."
            />

            <TextAreaField
              label="Description"
              value={form.ctaDescription ?? ""}
              onChange={(value) => updateField("ctaDescription", value)}
              placeholder="Keep browsing the tour catalog..."
              rows={4}
            />
          </div>
        </SectionCard>
      </div>

      <aside className="mr-5 mt-5 rounded-2xl border border-base-300 bg-base-200/35 p-5 shadow-sm xl:sticky xl:top-6 xl:h-fit">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-base-content">
            Homepage overview
          </h4>
          <p className="text-sm text-base-content/65">
            Review what is live, how much is curated manually, and what the hero
            currently looks like.
          </p>
        </div>

        <div
          className="mt-5 overflow-hidden rounded-2xl border border-base-300 bg-slate-950"
          style={{
            backgroundImage: previewConfig.heroImageUrl
              ? `url(${previewConfig.heroImageUrl})`
              : undefined,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div
            className="space-y-2 px-4 py-5"
            style={{
              background: getHeroOverlayPreviewBackground(previewConfig),
              color: getHeroTextPreviewColor(previewConfig),
            }}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5" />
              Hero preview
            </div>
            <p className="text-lg font-semibold leading-tight">
              {previewConfig.heroTitle}
            </p>
            <p className="text-sm leading-6" style={{ opacity: 0.85 }}>
              {previewConfig.heroSubtitle}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-current/20 bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                <Link2 className="h-3.5 w-3.5" />
                {previewConfig.heroButtonText}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <p className="text-sm font-medium text-base-content">Sections</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sectionStatuses.map((section) => (
                <span
                  key={section.label}
                  className={`badge ${
                    section.enabled
                      ? "badge-primary badge-outline"
                      : "badge-ghost"
                  }`}
                >
                  {section.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 text-sm text-base-content/75">
            <p className="font-medium text-base-content">Curated tour usage</p>
            <div className="mt-3 space-y-2">
              <SummaryRow
                label="Featured picks"
                value={`${form.featuredTourIds.length}`}
              />
              <SummaryRow
                label="Spotlight pool"
                value={`${form.highlightedTourIds.length}`}
              />
              <SummaryRow
                label="Specific collection overrides"
                value={`${
                  form.collectionBlocks.filter((block) => block.tourId).length
                }`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 text-sm text-base-content/75">
            <p className="font-medium text-base-content">Saved state</p>
            <div className="mt-3 space-y-2">
              <SummaryRow
                label="Created"
                value={formatStoreCustomizationDateTime(
                  config?.createdAt ?? undefined,
                )}
              />
              <SummaryRow
                label="Updated"
                value={formatStoreCustomizationDateTime(
                  config?.updatedAt ?? undefined,
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset
          </button>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm mt-4"
          onClick={() => void loadConfig()}
        >
          Reload homepage settings
        </button>
      </aside>
    </div>
  );
}




