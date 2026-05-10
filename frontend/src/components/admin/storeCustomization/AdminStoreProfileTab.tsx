"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import TitleText from "@/components/common/TitleText";
import { StorefrontService } from "@/lib/storefront/storefrontService";
import { uploadStorefrontAsset } from "@/lib/storefront/storefrontAssetService";
import { buildStorefrontUpdatePayload } from "@/lib/storefront/storefrontPayload";
import {
  DEFAULT_STOREFRONT_SETTINGS,
  type StorefrontSettingsDto,
  type UpdateStorefrontSettingsRequestDto,
} from "@/types/storefront";

import {
  formatStoreCustomizationDateTime,
  type StoreCustomizationTabProps,
} from "./storeCustomizationHeader";
import FaviconTile from "./components/FaviconTile";
import LogoTile from "./components/LogoTile";

type StoreProfileFieldName =
  | "siteName"
  | "contactEmail"
  | "logoUrl"
  | "faviconUrl";

type StoreProfileForm = Record<StoreProfileFieldName, string>;
type FieldErrors = Partial<Record<StoreProfileFieldName, string>>;

const EMPTY_FORM: StoreProfileForm = {
  siteName: DEFAULT_STOREFRONT_SETTINGS.siteName,
  contactEmail: DEFAULT_STOREFRONT_SETTINGS.contactEmail ?? "",
  logoUrl: DEFAULT_STOREFRONT_SETTINGS.logoUrl ?? "",
  faviconUrl: DEFAULT_STOREFRONT_SETTINGS.faviconUrl ?? "",
};

const STORE_PROFILE_FIELDS = Object.keys(EMPTY_FORM) as StoreProfileFieldName[];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toForm = (settings: StorefrontSettingsDto): StoreProfileForm => ({
  siteName: settings.siteName ?? DEFAULT_STOREFRONT_SETTINGS.siteName,
  contactEmail: settings.contactEmail ?? "",
  logoUrl: settings.logoUrl ?? DEFAULT_STOREFRONT_SETTINGS.logoUrl ?? "",
  faviconUrl: settings.faviconUrl ?? "",
});

const normalizeOptionalString = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

const validateForm = (form: StoreProfileForm): FieldErrors => {
  const nextErrors: FieldErrors = {};

  if (!form.siteName.trim()) {
    nextErrors.siteName = "Website name is required.";
  }

  const contactEmail = form.contactEmail.trim();
  if (contactEmail && !emailPattern.test(contactEmail)) {
    nextErrors.contactEmail = "Enter a valid email address.";
  }

  return nextErrors;
};

export default function AdminStoreProfileTab({
  onHeaderMetaChange,
}: StoreCustomizationTabProps) {
  const [settings, setSettings] = useState<StorefrontSettingsDto | null>(null);
  const [form, setForm] = useState<StoreProfileForm>(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState<StoreProfileForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextSettings = await StorefrontService.get();
      const nextForm = toForm({
        ...DEFAULT_STOREFRONT_SETTINGS,
        ...nextSettings,
      });

      setSettings(nextSettings);
      setForm(nextForm);
      setInitialForm(nextForm);
      setFieldErrors({});
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load the website profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const hasChanges = useMemo(
    () =>
      STORE_PROFILE_FIELDS.some(
        (fieldName) => form[fieldName] !== initialForm[fieldName],
      ),
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
          : "Using default storefront profile",
    });
  }, [
    hasChanges,
    onHeaderMetaChange,
    settings?.createdAt,
    settings?.updatedAt,
  ]);

  const updateField = (fieldName: StoreProfileFieldName, value: string) => {
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

  const handleAssetUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    {
      folder,
      fieldName,
      setUploading,
      successMessage,
    }: {
      folder: "logos" | "favicons";
      fieldName: "logoUrl" | "faviconUrl";
      setUploading: (value: boolean) => void;
      successMessage: string;
    },
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedAsset = await uploadStorefrontAsset({
        file,
        folder,
      });

      updateField(fieldName, uploadedAsset.imageUrl);
      toast.success(successMessage);
    } catch (uploadError) {
      console.error(uploadError);
      setError("Failed to upload the image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      return;
    }

    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: UpdateStorefrontSettingsRequestDto =
        buildStorefrontUpdatePayload(settings, {
          siteName: form.siteName.trim(),
          contactEmail: normalizeOptionalString(form.contactEmail),
          logoUrl: normalizeOptionalString(form.logoUrl),
          faviconUrl: normalizeOptionalString(form.faviconUrl),
        });

      const updatedSettings = await StorefrontService.update(payload);
      const nextForm = toForm({
        ...DEFAULT_STOREFRONT_SETTINGS,
        ...updatedSettings,
      });

      setSettings(updatedSettings);
      setForm(nextForm);
      setInitialForm(nextForm);
      setFieldErrors({});
      toast.success("Website profile updated.");
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to update the website profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setFieldErrors({});
    setError(null);
  };

  const displayName =
    form.siteName.trim() || DEFAULT_STOREFRONT_SETTINGS.siteName;
  const displayLogo = form.logoUrl.trim() || null;
  const displayEmail = form.contactEmail.trim() || null;
  const displayFavicon = form.faviconUrl.trim() || null;
  const isUploading = logoUploading || faviconUploading;

  if (loading) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-10 m-4 text-sm text-base-content/60">
        Loading website profile...
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <section className="border-b border-base-300 bg-base-100 py-4 ">
          <div className="space-y-1 px-4 sm:px-5">
            <h4 className="text-base font-semibold text-base-content">
              Store identity
            </h4>
            <p className="text-sm text-base-content/65">
              These values drive the public website name and primary email
              across the header, footer, contact page, and browser metadata.
            </p>
          </div>

          <div className="mt-5 px-4 sm:px-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-base-content">
                Website name
              </span>
              <input
                type="text"
                className={`input input-bordered w-full ${
                  fieldErrors.siteName ? "input-error" : ""
                }`}
                value={form.siteName}
                onChange={(event) =>
                  updateField("siteName", event.target.value)
                }
              />
              {fieldErrors.siteName ? (
                <span className="text-sm text-error">
                  {fieldErrors.siteName}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-base-content">
                Website email
              </span>
              <input
                type="email"
                className={`input input-bordered w-full ${
                  fieldErrors.contactEmail ? "input-error" : ""
                }`}
                value={form.contactEmail}
                onChange={(event) =>
                  updateField("contactEmail", event.target.value)
                }
                placeholder="hello@tourhub.com"
              />
              {fieldErrors.contactEmail ? (
                <span className="text-sm text-error">
                  {fieldErrors.contactEmail}
                </span>
              ) : (
                <span className="text-sm text-base-content/55">
                  Used in the footer, contact page, and legal contact lines.
                </span>
              )}
            </label>
          </div>
        </section>

        <section className="bg-base-100 py-4 ">
          <div className="space-y-1 px-4 sm:px-5">
            <h4 className="text-base font-semibold text-base-content">
              Brand assets
            </h4>
            <p className="text-sm text-base-content/65">
              Upload the website logo used in the header and footer, plus the
              favicon shown in the browser tab.
            </p>
          </div>

          <div className="mt-5 px-4 sm:px-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
              <p className="text-sm font-medium text-base-content">
                Website logo
              </p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-base-300 bg-base-100">
                  <LogoTile imageUrl={displayLogo} label={displayName} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={saving || isUploading}
                    >
                      {logoUploading ? "Uploading..." : "Upload logo"}
                    </button>

                    {displayLogo ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => updateField("logoUrl", "")}
                        disabled={saving || isUploading}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm text-base-content/60">
                    Use a square or near-square brand mark for the shared header
                    and footer logo.
                  </p>
                </div>
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                className="hidden"
                onChange={(event) =>
                  void handleAssetUpload(event, {
                    folder: "logos",
                    fieldName: "logoUrl",
                    setUploading: setLogoUploading,
                    successMessage: "Logo uploaded.",
                  })
                }
              />
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
              <p className="text-sm font-medium text-base-content">Favicon</p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-base-300 bg-base-100">
                  <FaviconTile imageUrl={displayFavicon} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={saving || isUploading}
                    >
                      {faviconUploading ? "Uploading..." : "Upload favicon"}
                    </button>

                    {displayFavicon ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => updateField("faviconUrl", "")}
                        disabled={saving || isUploading}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm text-base-content/60">
                    Use a small brand icon for tabs, bookmarks, and browser
                    chrome.
                  </p>
                </div>
              </div>

              <input
                ref={faviconInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                className="hidden"
                onChange={(event) =>
                  void handleAssetUpload(event, {
                    folder: "favicons",
                    fieldName: "faviconUrl",
                    setUploading: setFaviconUploading,
                    successMessage: "Favicon uploaded.",
                  })
                }
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="rounded-2xl border border-base-300 bg-base-200/35 p-5 mt-5 mr-5 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-base-content">
            Live snapshot
          </h4>
          <p className="text-sm text-base-content/65">
            A quick preview of how the current website profile will read across
            the public shell.
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
          <div className="border-b border-base-300 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
              Header
            </p>
            <div className="mt-2">
              <TitleText title={displayName} image={displayLogo} />
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
              Footer
            </p>
            <div className="mt-2">
              <TitleText title={displayName} image={displayLogo} />
              <p className="mt-2 text-sm text-base-content/70">
                {displayEmail || "Add a website email"}
              </p>
            </div>
          </div>
          <div className="border-t border-base-300 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
              Browser tab
            </p>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/35 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-base-300 bg-base-100">
                <FaviconTile imageUrl={displayFavicon} />
              </div>
              <p className="text-sm font-medium text-base-content">
                {displayName}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm text-base-content/80">
          <div>
            <p className="font-medium text-base-content">Website email</p>
            <p>{displayEmail || "Not configured yet"}</p>
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
            disabled={!hasChanges || saving || isUploading}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            disabled={!hasChanges || saving || isUploading}
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

