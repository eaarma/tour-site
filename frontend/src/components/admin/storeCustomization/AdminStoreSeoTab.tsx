"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

import { uploadStorefrontAsset } from "@/lib/storefront/storefrontAssetService";
import { buildStorefrontUpdatePayload } from "@/lib/storefront/storefrontPayload";
import { StorefrontService } from "@/lib/storefront/storefrontService";
import {
  buildMetadataDescription,
  buildMetadataKeywords,
  buildMetadataTitle,
  resolveMetadataImage,
} from "@/lib/storefront/storeSeo";
import {
  DEFAULT_STOREFRONT_SETTINGS,
  type StorefrontSettingsDto,
} from "@/types/storefront";

import {
  formatStoreCustomizationDateTime,
  type StoreCustomizationTabProps,
} from "./storeCustomizationHeader";
import PreviewRow from "./components/PreviewRow";
import SectionCard from "./components/SectionCard";
import TextAreaField from "./components/TextAreaField";
import TextField from "./components/TextField";

type SeoForm = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
  allowIndexing: boolean;
};

type SeoFieldName = keyof Omit<SeoForm, "allowIndexing">;
type SeoFieldErrors = Partial<Record<SeoFieldName, string>>;

const EMPTY_SEO_FORM: SeoForm = {
  seoTitle: "",
  seoDescription: DEFAULT_STOREFRONT_SETTINGS.seoDescription ?? "",
  seoKeywords: "",
  ogImageUrl: "",
  allowIndexing: DEFAULT_STOREFRONT_SETTINGS.allowIndexing,
};

const OG_IMAGE_URL_PLACEHOLDER = "https://example.com/og-image.jpg";

const normalizeOptionalString = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const toSeoForm = (settings: StorefrontSettingsDto): SeoForm => ({
  seoTitle: settings.seoTitle ?? "",
  seoDescription:
    settings.seoDescription ?? DEFAULT_STOREFRONT_SETTINGS.seoDescription ?? "",
  seoKeywords: settings.seoKeywords ?? "",
  ogImageUrl: settings.ogImageUrl ?? "",
  allowIndexing: settings.allowIndexing,
});

const isValidSeoImageUrl = (value: string) => {
  if (!value.trim()) {
    return true;
  }

  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const validateSeoForm = (form: SeoForm): SeoFieldErrors => {
  const nextErrors: SeoFieldErrors = {};

  if (form.seoTitle.trim().length > 255) {
    nextErrors.seoTitle = "Keep the SEO title under 255 characters.";
  }

  if (form.seoDescription.trim().length > 320) {
    nextErrors.seoDescription =
      "Keep the SEO description under 320 characters for cleaner search snippets.";
  }

  if (form.seoKeywords.trim().length > 500) {
    nextErrors.seoKeywords = "Keep keywords concise and focused.";
  }

  if (!isValidSeoImageUrl(form.ogImageUrl.trim())) {
    nextErrors.ogImageUrl =
      "Enter a valid absolute image URL or a root-relative path such as /og-image.jpg.";
  }

  return nextErrors;
};

export default function AdminStoreSeoTab({
  onHeaderMetaChange,
}: StoreCustomizationTabProps) {
  const [settings, setSettings] = useState<StorefrontSettingsDto | null>(null);
  const [form, setForm] = useState<SeoForm>(EMPTY_SEO_FORM);
  const [initialForm, setInitialForm] = useState<SeoForm>(EMPTY_SEO_FORM);
  const [fieldErrors, setFieldErrors] = useState<SeoFieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ogImageUploading, setOgImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ogImageInputRef = useRef<HTMLInputElement | null>(null);

  const applyLoadedSettings = useCallback((data: StorefrontSettingsDto) => {
    const normalizedSettings = {
      ...DEFAULT_STOREFRONT_SETTINGS,
      ...data,
    };
    const nextForm = toSeoForm(normalizedSettings);

    setSettings(normalizedSettings);
    setForm(nextForm);
    setInitialForm(nextForm);
    setFieldErrors({});
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await StorefrontService.get();
      applyLoadedSettings(data);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load SEO settings.");
    } finally {
      setLoading(false);
    }
  }, [applyLoadedSettings]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
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
          : "Using default SEO settings",
    });
  }, [
    hasChanges,
    onHeaderMetaChange,
    settings?.createdAt,
    settings?.updatedAt,
  ]);

  const updateField = (fieldName: SeoFieldName, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
    setError(null);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }));
  };

  const handleReset = () => {
    setForm(initialForm);
    setFieldErrors({});
    setError(null);
  };

  const handleOgImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setOgImageUploading(true);
    setError(null);

    try {
      const uploadedAsset = await uploadStorefrontAsset({
        file,
        folder: "seo",
      });

      updateField("ogImageUrl", uploadedAsset.imageUrl);
      toast.success("Open Graph image uploaded.");
    } catch (uploadError) {
      console.error(uploadError);
      setError("Failed to upload the Open Graph image. Please try again.");
    } finally {
      setOgImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!settings || !hasChanges) {
      return;
    }

    const nextErrors = validateSeoForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted SEO fields before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedSettings = await StorefrontService.update(
        buildStorefrontUpdatePayload(settings, {
          seoTitle: normalizeOptionalString(form.seoTitle),
          seoDescription: normalizeOptionalString(form.seoDescription),
          seoKeywords: normalizeOptionalString(form.seoKeywords),
          ogImageUrl: normalizeOptionalString(form.ogImageUrl),
          allowIndexing: form.allowIndexing,
        }),
      );

      applyLoadedSettings(updatedSettings);
      toast.success("SEO defaults updated.");
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to update SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  const previewStorefront = useMemo(
    () => ({
      ...(settings ?? DEFAULT_STOREFRONT_SETTINGS),
      seoTitle: normalizeOptionalString(form.seoTitle),
      seoDescription:
        normalizeOptionalString(form.seoDescription) ??
        DEFAULT_STOREFRONT_SETTINGS.seoDescription,
      seoKeywords: normalizeOptionalString(form.seoKeywords),
      ogImageUrl: normalizeOptionalString(form.ogImageUrl),
      allowIndexing: form.allowIndexing,
    }),
    [form, settings],
  );

  const previewTitle = buildMetadataTitle(previewStorefront);
  const previewDescription = buildMetadataDescription(previewStorefront);
  const previewKeywords = buildMetadataKeywords(
    previewStorefront.seoKeywords,
    null,
  );
  const previewImage = resolveMetadataImage(previewStorefront);
  const isUploading = ogImageUploading;

  if (loading) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-10 m-4 text-sm text-base-content/60">
        Loading SEO settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-6">
        <p className="text-sm text-error">
          {error ?? "Could not load SEO settings."}
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm mt-4"
          onClick={() => void loadSettings()}
        >
          Retry
        </button>
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
          sectionClassName="py-4"
          title="Search defaults"
          description="These values act as the storefront fallback for the homepage and other public pages that do not define more specific metadata yet."
        >
          <TextField
            layout="grid"
            label="Default SEO title"
            value={form.seoTitle}
            onChange={(value) => updateField("seoTitle", value)}
            placeholder={settings.siteName}
            maxLength={255}
            error={fieldErrors.seoTitle}
          />

          <TextAreaField
            layout="grid"
            label="SEO description"
            value={form.seoDescription}
            onChange={(value) => updateField("seoDescription", value)}
            rows={4}
            maxLength={320}
            placeholder="A concise description for search engines and social previews."
            error={fieldErrors.seoDescription}
          />

          <TextAreaField
            layout="grid"
            label="Keywords"
            value={form.seoKeywords}
            onChange={(value) => updateField("seoKeywords", value)}
            rows={3}
            maxLength={500}
            placeholder="city tours, guided tours, sightseeing, local experiences"
            error={fieldErrors.seoKeywords}
          />
        </SectionCard>

        <SectionCard
          sectionClassName="py-4"
          title="Social preview"
          description="Choose the image that should appear when your storefront is shared in search results, chat apps, and social feeds."
        >
          <TextField
            layout="grid"
            label="Open Graph image URL"
            value={form.ogImageUrl}
            onChange={(value) => updateField("ogImageUrl", value)}
            maxLength={500}
            placeholder={OG_IMAGE_URL_PLACEHOLDER}
            error={fieldErrors.ogImageUrl}
          />

          <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
            <p className="text-sm font-medium text-base-content">
              Open Graph image upload
            </p>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-base-300 bg-base-100">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Open Graph preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-3 text-center text-xs font-medium uppercase tracking-wide text-base-content/45">
                    No image
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => ogImageInputRef.current?.click()}
                    disabled={saving || isUploading}
                  >
                    {ogImageUploading ? "Uploading..." : "Upload image"}
                  </button>

                  {form.ogImageUrl.trim() ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => updateField("ogImageUrl", "")}
                      disabled={saving || isUploading}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-6 text-base-content/60">
                  Uploading sets the Open Graph URL automatically, so you can
                  keep using either a hosted image URL or a file from the
                  storefront asset library.
                </p>
              </div>
            </div>

            <input
              ref={ogImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
              className="hidden"
              onChange={(event) => void handleOgImageUpload(event)}
            />
          </div>

          <p className="text-sm leading-6 text-base-content/60">
            Use an absolute URL or a root-relative path like{" "}
            <code>/images/social-preview.jpg</code>. If you leave this empty,
            the site logo is used as the fallback.
          </p>
        </SectionCard>

        <SectionCard
          sectionClassName="py-4"
          title="Indexing"
          description="Control whether the storefront tells search engines to index and follow these public pages."
        >
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-base-300 bg-base-200/20 p-4">
            <div className="min-w-0">
              <p className="font-medium text-base-content">
                Allow search indexing
              </p>
              <p className="mt-1 text-sm leading-6 text-base-content/60">
                This sets the page-level robots metadata and the generated
                robots route for the storefront.
              </p>
            </div>

            <input
              type="checkbox"
              className="toggle toggle-primary mt-1"
              checked={form.allowIndexing}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  allowIndexing: event.target.checked,
                }))
              }
            />
          </label>
        </SectionCard>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            disabled={!hasChanges || saving || isUploading}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleSave()}
            disabled={!hasChanges || saving || isUploading}
          >
            {saving ? "Saving..." : "Save SEO defaults"}
          </button>
        </div>
      </div>

      <aside className="rounded-2xl border border-base-300 bg-base-200/35 p-5 mt-5 mr-5 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-base-content">
            Metadata preview
          </h4>
          <p className="text-sm text-base-content/65">
            Preview the resolved title, description, keywords, social image, and
            indexing state before you save.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-base-300 bg-base-100 p-4">
          <p className="text-sm font-semibold text-primary">{previewTitle}</p>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            {previewDescription ||
              "Add a description to control how the storefront appears in search and social previews."}
          </p>
        </div>

        <div className="mt-5 space-y-4 text-sm text-base-content/80">
          <PreviewRow label="Resolved title" value={previewTitle} />
          <PreviewRow
            label="Resolved description"
            value={previewDescription || "No SEO description set"}
          />
          <PreviewRow
            label="Keywords"
            value={previewKeywords?.join(", ") || "No keywords set"}
          />
          <PreviewRow
            label="Open Graph image"
            value={previewImage || "Using site logo fallback"}
          />
          <PreviewRow
            label="Robots"
            value={form.allowIndexing ? "index, follow" : "noindex, nofollow"}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-base-300 bg-base-100 p-4 text-sm leading-6 text-base-content/65">
          The SEO description also feeds the storefront&apos;s structured data
          snippet, so it helps both search previews and machine-readable site
          context.
        </div>
      </aside>
    </div>
  );
}

