"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import TitleText from "@/components/common/TitleText";
import { buildStorefrontUpdatePayload } from "@/lib/storefront/storefrontPayload";
import { StorefrontService } from "@/lib/storefront/storefrontService";
import {
  STOREFRONT_BASE_PRESET_OPTIONS,
  STOREFRONT_THEME_NAME,
  applyStorefrontThemeToDocument,
  buildStorefrontThemeStyle,
  getStorefrontBasePresetDefinition,
  normalizeHexColor,
  normalizeStorefrontBasePreset,
} from "@/lib/storefront/storefrontTheme";
import {
  DEFAULT_STOREFRONT_SETTINGS,
  type StorefrontBasePreset,
  type StorefrontSettingsDto,
  type UpdateStorefrontSettingsRequestDto,
} from "@/types/storefront";

import {
  formatStoreCustomizationDateTime,
  type StoreCustomizationTabProps,
} from "./storeCustomizationHeader";
import BasePresetCard from "./components/BasePresetCard";
import ColorField from "./components/ColorField";
import ColorSwatch from "./components/ColorSwatch";
import PreviewStat from "./components/PreviewStat";

type BrandingFieldName = "basePreset" | "primaryColor" | "accentColor";

type BrandingForm = {
  basePreset: StorefrontBasePreset;
  primaryColor: string;
  accentColor: string;
};

type BrandingFieldErrors = Partial<Record<BrandingFieldName, string>>;

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{6})$/i;

const EMPTY_FORM: BrandingForm = {
  basePreset: DEFAULT_STOREFRONT_SETTINGS.basePreset,
  primaryColor: DEFAULT_STOREFRONT_SETTINGS.primaryColor,
  accentColor: DEFAULT_STOREFRONT_SETTINGS.accentColor,
};

const toBrandingForm = (settings: StorefrontSettingsDto): BrandingForm => ({
  basePreset: normalizeStorefrontBasePreset(settings.basePreset),
  primaryColor: normalizeHexColor(
    settings.primaryColor,
    DEFAULT_STOREFRONT_SETTINGS.primaryColor,
  ),
  accentColor: normalizeHexColor(
    settings.accentColor,
    DEFAULT_STOREFRONT_SETTINGS.accentColor,
  ),
});

const validateBrandingForm = (form: BrandingForm): BrandingFieldErrors => {
  const nextErrors: BrandingFieldErrors = {};

  if (!HEX_COLOR_PATTERN.test(form.primaryColor)) {
    nextErrors.primaryColor = "Enter a valid 6-digit hex color.";
  }

  if (!HEX_COLOR_PATTERN.test(form.accentColor)) {
    nextErrors.accentColor = "Enter a valid 6-digit hex color.";
  }

  return nextErrors;
};

export default function AdminStoreBrandingTab({
  onHeaderMetaChange,
}: StoreCustomizationTabProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<StorefrontSettingsDto | null>(null);
  const [form, setForm] = useState<BrandingForm>(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState<BrandingForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<BrandingFieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextSettings = await StorefrontService.get();
      const normalizedSettings = {
        ...DEFAULT_STOREFRONT_SETTINGS,
        ...nextSettings,
      };
      const nextForm = toBrandingForm(normalizedSettings);

      setSettings(normalizedSettings);
      setForm(nextForm);
      setInitialForm(nextForm);
      setFieldErrors({});
      applyStorefrontThemeToDocument(normalizedSettings);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load branding settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const hasChanges = useMemo(
    () =>
      form.basePreset !== initialForm.basePreset ||
      form.primaryColor !== initialForm.primaryColor ||
      form.accentColor !== initialForm.accentColor,
    [form, initialForm],
  );

  useEffect(() => {
    onHeaderMetaChange?.({
      statusBadgeClassName: hasChanges
        ? "badge-warning badge-outline"
        : "badge-success badge-outline",
      statusBadgeLabel: hasChanges ? "Unsaved changes" : "Saved",
      lastUpdatedLabel: settings?.updatedAt
        ? `Last updated ${formatStoreCustomizationDateTime(settings.updatedAt)}`
        : settings?.createdAt
          ? `Created ${formatStoreCustomizationDateTime(settings.createdAt)}`
          : "Using default storefront branding",
    });
  }, [
    hasChanges,
    onHeaderMetaChange,
    settings?.createdAt,
    settings?.updatedAt,
  ]);

  const selectedBasePreset = getStorefrontBasePresetDefinition(form.basePreset);
  const previewThemeStyle = buildStorefrontThemeStyle({
    basePreset: form.basePreset,
    primaryColor: form.primaryColor,
    accentColor: form.accentColor,
  });
  const displayName =
    settings?.siteName?.trim() || DEFAULT_STOREFRONT_SETTINGS.siteName;
  const displayLogo = settings?.logoUrl?.trim() || null;

  const updateField = (fieldName: BrandingFieldName, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]:
        fieldName === "basePreset"
          ? normalizeStorefrontBasePreset(value)
          : value.toLowerCase(),
    }));

    setError(null);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }));
  };

  const handleColorPickerChange = (
    fieldName: Extract<BrandingFieldName, "primaryColor" | "accentColor">,
    value: string,
  ) => {
    updateField(
      fieldName,
      normalizeHexColor(value, DEFAULT_STOREFRONT_SETTINGS[fieldName]),
    );
  };

  const handleSave = async () => {
    if (!hasChanges) {
      return;
    }

    const nextErrors = validateBrandingForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted branding fields before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: UpdateStorefrontSettingsRequestDto =
        buildStorefrontUpdatePayload(settings, {
          basePreset: form.basePreset,
          primaryColor: normalizeHexColor(
            form.primaryColor,
            DEFAULT_STOREFRONT_SETTINGS.primaryColor,
          ),
          accentColor: normalizeHexColor(
            form.accentColor,
            DEFAULT_STOREFRONT_SETTINGS.accentColor,
          ),
        });

      const updatedSettings = await StorefrontService.update(payload);
      const normalizedSettings = {
        ...DEFAULT_STOREFRONT_SETTINGS,
        ...updatedSettings,
      };
      const nextForm = toBrandingForm(normalizedSettings);

      setSettings(normalizedSettings);
      setForm(nextForm);
      setInitialForm(nextForm);
      setFieldErrors({});
      applyStorefrontThemeToDocument(normalizedSettings);
      router.refresh();
      toast.success("Storefront branding updated.");
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to update the storefront branding.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setFieldErrors({});
    setError(null);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-10 m-4 text-sm text-base-content/60">
        Loading branding settings...
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

        <section className="border-b border-base-300 bg-base-100 py-4">
          <div className="space-y-1 px-4 sm:px-5">
            <h4 className="text-base font-semibold text-base-content">
              Base surfaces
            </h4>
            <p className="text-sm text-base-content/65">
              Choose a light or dark surface set for `base-100`, `base-200`, and
              `base-300`. The shell stays controlled while the storefront still
              gets room for personality.
            </p>
          </div>

          <div className="mt-5 grid gap-3 px-4 sm:px-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {STOREFRONT_BASE_PRESET_OPTIONS.map((option) => (
              <BasePresetCard
                key={option.value}
                preset={option.value}
                label={option.label}
                description={option.description}
                selected={form.basePreset === option.value}
                onSelect={(preset) => updateField("basePreset", preset)}
              />
            ))}
          </div>
        </section>

        <section className="bg-base-100 py-4">
          <div className="space-y-1 px-4 sm:px-5">
            <h4 className="text-base font-semibold text-base-content">
              Brand colors
            </h4>
            <p className="text-sm text-base-content/65">
              Primary drives the main calls to action. Accent handles
              highlights, supporting emphasis, and smaller attention cues across
              the shell.
            </p>
          </div>

          <div className="mt-5 grid gap-4 px-4 sm:px-5 md:grid-cols-2">
            <ColorField
              label="Main color"
              description="Buttons, active states, key links, and the main call to action."
              value={form.primaryColor}
              fallbackColor={DEFAULT_STOREFRONT_SETTINGS.primaryColor}
              placeholder="#0284c7"
              descriptionClassName="mt-2"
              error={fieldErrors.primaryColor}
              onPickerChange={(value) =>
                handleColorPickerChange("primaryColor", value)
              }
              onTextChange={(value) => updateField("primaryColor", value)}
            />

            <ColorField
              label="Accent color"
              description="Highlights, secondary attention cues, and accent actions."
              value={form.accentColor}
              fallbackColor={DEFAULT_STOREFRONT_SETTINGS.accentColor}
              placeholder="#f97316"
              descriptionClassName="mt-2"
              error={fieldErrors.accentColor}
              onPickerChange={(value) =>
                handleColorPickerChange("accentColor", value)
              }
              onTextChange={(value) => updateField("accentColor", value)}
            />
          </div>
        </section>
      </div>

      <aside className="rounded-2xl border border-base-300 bg-base-200/35 p-5 mt-5 mr-5 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-base-content">
            Live snapshot
          </h4>
          <p className="text-sm text-base-content/65">
            Preview the shell colors before they flow into the public header,
            cards, buttons, and footer.
          </p>
        </div>

        <div
          data-theme={STOREFRONT_THEME_NAME}
          style={previewThemeStyle}
          className="mt-5 overflow-hidden rounded-2xl border border-base-300 bg-base-100"
        >
          <div className="border-b border-base-300 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
              Header
            </p>
            <div className="mt-2">
              <TitleText title={displayName} image={displayLogo} />
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                Selected base
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-base-content">
                  {selectedBasePreset.label}
                </p>
                <span className="badge badge-outline">
                  {selectedBasePreset.colorScheme === "dark" ? "Dark" : "Light"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-base-content/70">
                {selectedBasePreset.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary btn-sm">
                  Main CTA
                </button>
                <button type="button" className="btn btn-accent btn-sm">
                  Accent CTA
                </button>
                <button type="button" className="btn btn-outline btn-sm">
                  Outline
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <PreviewStat
                label="Base 100"
                value="Page shell"
                className="bg-base-100"
              />
              <PreviewStat
                label="Base 200"
                value="Layer"
                className="bg-base-200"
              />
              <PreviewStat
                label="Base 300"
                value="Border"
                className="bg-base-300"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ColorSwatch
                label="Main"
                value={form.primaryColor}
                color={form.primaryColor}
                fallbackColor={DEFAULT_STOREFRONT_SETTINGS.primaryColor}
              />
              <ColorSwatch
                label="Accent"
                value={form.accentColor}
                color={form.accentColor}
                fallbackColor={DEFAULT_STOREFRONT_SETTINGS.accentColor}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm text-base-content/80">
          <div>
            <p className="font-medium text-base-content">Base preset</p>
            <p>{selectedBasePreset.label}</p>
          </div>
          <div>
            <p className="font-medium text-base-content">Created</p>
            <p>
              {formatStoreCustomizationDateTime(
                settings?.createdAt ?? undefined,
              )}
            </p>
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

        {settings ? null : (
          <button
            type="button"
            className="btn btn-outline btn-sm mt-4"
            onClick={() => void loadSettings()}
          >
            Retry loading
          </button>
        )}
      </aside>
    </div>
  );
}

