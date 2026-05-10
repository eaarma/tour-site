"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

import { buildStorefrontUpdatePayload } from "@/lib/storefront/storefrontPayload";
import { StorePageService } from "@/lib/storefront/storePageService";
import { normalizeStorePage } from "@/lib/storefront/storePageDefaults";
import { StorefrontService } from "@/lib/storefront/storefrontService";
import type {
  ContactPageContentDto,
  StorePageDto,
  UpdateStorePageRequestDto,
} from "@/types/storePage";
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
import ToggleCard from "./components/ToggleCard";

type ContactForm = {
  contactEmail: string;
  contactReceiverEmail: string;
  supportPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  businessHours: string;
  showContactEmail: boolean;
  showSupportPhone: boolean;
  showAddress: boolean;
  showBusinessHours: boolean;
  eyebrow: string;
  title: string;
  description: string;
  detailsTitle: string;
  detailsDescription: string;
  bestForTitle: string;
  bestForDescription: string;
  messageTitle: string;
  messageDescription: string;
  emptyDetailsMessage: string;
  submitButtonLabel: string;
  closingNote: string;
};

type ContactFieldName =
  | "contactEmail"
  | "contactReceiverEmail"
  | "supportPhone"
  | "eyebrow"
  | "title"
  | "detailsTitle"
  | "detailsDescription"
  | "bestForTitle"
  | "bestForDescription"
  | "messageTitle"
  | "messageDescription"
  | "emptyDetailsMessage"
  | "submitButtonLabel";

type ContactFieldErrors = Partial<Record<ContactFieldName, string>>;

const CONTACT_EMAIL_TOKEN_PATTERN = /\{\{\s*contactEmail\s*\}\}/gi;
const SITE_NAME_TOKEN_PATTERN = /\{\{\s*siteName\s*\}\}/gi;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9. ()-]{7,25}$/;

const DEFAULT_CONTACT_PAGE = normalizeStorePage("contact");

const normalizeOptionalString = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const resolvePreviewText = (
  value: string,
  {
    contactEmail,
    siteName,
  }: {
    contactEmail: string | null;
    siteName: string;
  },
) =>
  value
    .replace(
      CONTACT_EMAIL_TOKEN_PATTERN,
      contactEmail?.trim() || "the contact address listed on our website",
    )
    .replace(SITE_NAME_TOKEN_PATTERN, siteName.trim() || "this website");

const formatAddressLines = (form: ContactForm) => {
  const locality = [form.city.trim(), form.postalCode.trim()]
    .filter(Boolean)
    .join(", ");

  return [
    form.addressLine1.trim(),
    form.addressLine2.trim(),
    locality,
    form.country.trim(),
  ].filter(Boolean);
};

const toContactForm = (
  settings: StorefrontSettingsDto,
  page: StorePageDto<ContactPageContentDto>,
): ContactForm => {
  const content = page.contentJson;

  return {
    contactEmail: settings.contactEmail ?? "",
    contactReceiverEmail: settings.contactReceiverEmail ?? "",
    supportPhone: settings.supportPhone ?? "",
    addressLine1: settings.addressLine1 ?? "",
    addressLine2: settings.addressLine2 ?? "",
    city: settings.city ?? "",
    postalCode: settings.postalCode ?? "",
    country: settings.country ?? "",
    businessHours: settings.businessHours ?? "",
    showContactEmail: settings.showContactEmail,
    showSupportPhone: settings.showSupportPhone,
    showAddress: settings.showAddress,
    showBusinessHours: settings.showBusinessHours,
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description ?? "",
    detailsTitle: content.detailsTitle ?? "",
    detailsDescription: content.detailsDescription ?? "",
    bestForTitle: content.bestForTitle ?? "",
    bestForDescription: content.bestForDescription ?? "",
    messageTitle: content.messageTitle ?? "",
    messageDescription: content.messageDescription ?? "",
    emptyDetailsMessage: content.emptyDetailsMessage ?? "",
    submitButtonLabel: content.submitButtonLabel ?? "",
    closingNote: page.closingNote ?? "",
  };
};

const EMPTY_FORM = toContactForm(
  DEFAULT_STOREFRONT_SETTINGS,
  DEFAULT_CONTACT_PAGE,
);

const validateForm = (form: ContactForm): ContactFieldErrors => {
  const nextErrors: ContactFieldErrors = {};

  if (
    form.contactEmail.trim() &&
    !emailPattern.test(form.contactEmail.trim())
  ) {
    nextErrors.contactEmail = "Enter a valid public contact email address.";
  }

  if (
    form.contactReceiverEmail.trim() &&
    !emailPattern.test(form.contactReceiverEmail.trim())
  ) {
    nextErrors.contactReceiverEmail =
      "Enter a valid contact form receiver email address.";
  }

  if (
    form.supportPhone.trim() &&
    !phonePattern.test(form.supportPhone.trim())
  ) {
    nextErrors.supportPhone = "Enter a valid phone number.";
  }

  if (!form.eyebrow.trim()) {
    nextErrors.eyebrow = "Top label is required.";
  }

  if (!form.title.trim()) {
    nextErrors.title = "Contact page title is required.";
  }

  if (!form.detailsTitle.trim()) {
    nextErrors.detailsTitle = "Details panel title is required.";
  }

  if (!form.detailsDescription.trim()) {
    nextErrors.detailsDescription = "Details panel description is required.";
  }

  if (!form.bestForTitle.trim()) {
    nextErrors.bestForTitle = "Best-for title is required.";
  }

  if (!form.bestForDescription.trim()) {
    nextErrors.bestForDescription = "Best-for description is required.";
  }

  if (!form.messageTitle.trim()) {
    nextErrors.messageTitle = "Message title is required.";
  }

  if (!form.messageDescription.trim()) {
    nextErrors.messageDescription = "Message description is required.";
  }

  if (!form.emptyDetailsMessage.trim()) {
    nextErrors.emptyDetailsMessage = "Fallback details message is required.";
  }

  if (!form.submitButtonLabel.trim()) {
    nextErrors.submitButtonLabel = "Submit button label is required.";
  }

  return nextErrors;
};

const buildContactPagePayload = (
  form: ContactForm,
): UpdateStorePageRequestDto<ContactPageContentDto> => ({
  eyebrow: form.eyebrow.trim(),
  title: form.title.trim(),
  description: normalizeOptionalString(form.description),
  contentJson: {
    detailsTitle: form.detailsTitle.trim(),
    detailsDescription: form.detailsDescription.trim(),
    bestForTitle: form.bestForTitle.trim(),
    bestForDescription: form.bestForDescription.trim(),
    messageTitle: form.messageTitle.trim(),
    messageDescription: form.messageDescription.trim(),
    emptyDetailsMessage: form.emptyDetailsMessage.trim(),
    submitButtonLabel: form.submitButtonLabel.trim(),
  },
  closingNote: normalizeOptionalString(form.closingNote),
});

export default function AdminStoreContactTab({
  onHeaderMetaChange,
}: StoreCustomizationTabProps) {
  const [settings, setSettings] = useState<StorefrontSettingsDto | null>(null);
  const [contactPage, setContactPage] =
    useState<StorePageDto<ContactPageContentDto> | null>(null);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState<ContactForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyLoadedData = useCallback(
    (
      loadedSettings: StorefrontSettingsDto,
      loadedPage: StorePageDto<ContactPageContentDto>,
    ) => {
      const normalizedSettings = {
        ...DEFAULT_STOREFRONT_SETTINGS,
        ...loadedSettings,
      };
      const normalizedPage = normalizeStorePage("contact", loadedPage);
      const nextForm = toContactForm(normalizedSettings, normalizedPage);

      setSettings(normalizedSettings);
      setContactPage(normalizedPage);
      setForm(nextForm);
      setInitialForm(nextForm);
      setFieldErrors({});
    },
    [],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [loadedSettings, loadedPage] = await Promise.all([
        StorefrontService.get(),
        StorePageService.getPage("contact") as Promise<
          StorePageDto<ContactPageContentDto>
        >,
      ]);

      applyLoadedData(loadedSettings, loadedPage);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load the contact settings.");
    } finally {
      setLoading(false);
    }
  }, [applyLoadedData]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

  useEffect(() => {
    const labels: string[] = [];

    if (settings?.updatedAt || settings?.createdAt) {
      labels.push(
        `Details ${formatStoreCustomizationDateTime(
          settings.updatedAt ?? settings.createdAt ?? undefined,
        )}`,
      );
    }

    if (contactPage?.updatedAt || contactPage?.createdAt) {
      labels.push(
        `Page ${formatStoreCustomizationDateTime(
          contactPage.updatedAt ?? contactPage.createdAt ?? undefined,
        )}`,
      );
    }

    onHeaderMetaChange?.({
      statusBadgeClassName: hasChanges
        ? "badge-warning badge-outline"
        : "badge-success badge-outline",
      statusBadgeLabel: hasChanges ? "Unsaved changes" : "Saved",
      lastUpdatedLabel:
        labels.join(" | ") || "Using default contact page and details",
    });
  }, [
    contactPage?.createdAt,
    contactPage?.updatedAt,
    hasChanges,
    onHeaderMetaChange,
    settings?.createdAt,
    settings?.updatedAt,
  ]);

  const previewSiteName =
    settings?.siteName?.trim() || DEFAULT_STOREFRONT_SETTINGS.siteName;
  const previewResolvedEmail = normalizeOptionalString(form.contactEmail);
  const previewAddressLines = formatAddressLines(form);

  const previewEyebrow = resolvePreviewText(form.eyebrow, {
    contactEmail: previewResolvedEmail,
    siteName: previewSiteName,
  });

  const previewTitle = resolvePreviewText(form.title, {
    contactEmail: previewResolvedEmail,
    siteName: previewSiteName,
  });

  const previewDescription = form.description.trim()
    ? resolvePreviewText(form.description, {
        contactEmail: previewResolvedEmail,
        siteName: previewSiteName,
      })
    : null;

  const updateField = (fieldName: keyof ContactForm, value: string) => {
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

  const updateToggle = (
    fieldName:
      | "showContactEmail"
      | "showSupportPhone"
      | "showAddress"
      | "showBusinessHours",
    value: boolean,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
    setError(null);
  };

  const handleReset = () => {
    setForm(initialForm);
    setFieldErrors({});
    setError(null);
  };

  const handleSave = async () => {
    if (!settings || !contactPage || !hasChanges) {
      return;
    }

    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted contact fields before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const [updatedSettings, updatedPage] = await Promise.all([
        StorefrontService.update(
          buildStorefrontUpdatePayload(settings, {
            contactEmail: normalizeOptionalString(form.contactEmail),
            contactReceiverEmail: normalizeOptionalString(
              form.contactReceiverEmail,
            ),
            supportPhone: normalizeOptionalString(form.supportPhone),
            addressLine1: normalizeOptionalString(form.addressLine1),
            addressLine2: normalizeOptionalString(form.addressLine2),
            city: normalizeOptionalString(form.city),
            postalCode: normalizeOptionalString(form.postalCode),
            country: normalizeOptionalString(form.country),
            businessHours: normalizeOptionalString(form.businessHours),
            showContactEmail: form.showContactEmail,
            showSupportPhone: form.showSupportPhone,
            showAddress: form.showAddress,
            showBusinessHours: form.showBusinessHours,
          }),
        ),
        StorePageService.updatePage(
          "contact",
          buildContactPagePayload(form),
        ) as Promise<StorePageDto<ContactPageContentDto>>,
      ]);

      applyLoadedData(updatedSettings, updatedPage);
      toast.success("Contact settings updated.");
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to update the contact settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-10 m-4 text-sm text-base-content/60">
        Loading contact settings...
      </div>
    );
  }

  if (!settings || !contactPage) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-6">
        <p className="text-sm text-error">
          {error ?? "Could not load the contact settings."}
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm mt-4"
          onClick={() => void loadData()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5 mt-4">
        {error ? (
          <div className="rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <SectionCard
          sectionClassName="pb-4"
          title="Support channels"
          description="Manage the public email and phone shown on the contact page, plus the private inbox that receives form submissions."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              layout="grid"
              label="Public contact email"
              value={form.contactEmail}
              onChange={(value) => updateField("contactEmail", value)}
              placeholder="hello@tourhub.com"
              error={fieldErrors.contactEmail}
            />
            <TextField
              layout="grid"
              label="Form receiver email"
              value={form.contactReceiverEmail}
              onChange={(value) => updateField("contactReceiverEmail", value)}
              placeholder="inbox@tourhub.com"
              error={fieldErrors.contactReceiverEmail}
            />
            <TextField
              layout="grid"
              label="Support phone"
              value={form.supportPhone}
              onChange={(value) => updateField("supportPhone", value)}
              placeholder="+372 5555 1234"
              error={fieldErrors.supportPhone}
            />
          </div>

          <TextAreaField
            layout="grid"
            label="Support hours"
            value={form.businessHours}
            onChange={(value) => updateField("businessHours", value)}
            rows={4}
            placeholder={"Mon-Fri: 09:00-17:00\nSat: 10:00-14:00"}
          />
        </SectionCard>

        <SectionCard
          sectionClassName="pb-4"
          title="Business address"
          description="These address details can be shown on the public contact page when the address toggle is enabled."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              layout="grid"
              label="Address line 1"
              value={form.addressLine1}
              onChange={(value) => updateField("addressLine1", value)}
              placeholder="Old Town Square 1"
            />
            <TextField
              layout="grid"
              label="Address line 2"
              value={form.addressLine2}
              onChange={(value) => updateField("addressLine2", value)}
              placeholder="Suite or floor"
            />
            <TextField
              layout="grid"
              label="City"
              value={form.city}
              onChange={(value) => updateField("city", value)}
              placeholder="Tallinn"
            />
            <TextField
              layout="grid"
              label="Postal code"
              value={form.postalCode}
              onChange={(value) => updateField("postalCode", value)}
              placeholder="10111"
            />
            <TextField
              layout="grid"
              label="Country"
              value={form.country}
              onChange={(value) => updateField("country", value)}
              placeholder="Estonia"
            />
          </div>
        </SectionCard>

        <SectionCard
          sectionClassName="pb-4"
          title="Public visibility"
          description="Choose which contact details appear in the public details panel."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <ToggleCard
              label="Show contact email"
              description="Display the public contact email card."
              checked={form.showContactEmail}
              onChange={(value) => updateToggle("showContactEmail", value)}
            />
            <ToggleCard
              label="Show support phone"
              description="Display the public phone number card."
              checked={form.showSupportPhone}
              onChange={(value) => updateToggle("showSupportPhone", value)}
            />
            <ToggleCard
              label="Show address"
              description="Display the business address card."
              checked={form.showAddress}
              onChange={(value) => updateToggle("showAddress", value)}
            />
            <ToggleCard
              label="Show support hours"
              description="Display the support hours card."
              checked={form.showBusinessHours}
              onChange={(value) => updateToggle("showBusinessHours", value)}
            />
          </div>
        </SectionCard>

        <SectionCard
          sectionClassName="pb-4"
          title="Page intro"
          description="Edit the top section that introduces the public contact page."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              layout="grid"
              label="Top label"
              value={form.eyebrow}
              onChange={(value) => updateField("eyebrow", value)}
              error={fieldErrors.eyebrow}
              placeholder="{{siteName}}"
            />
            <TextField
              layout="grid"
              label="Page title"
              value={form.title}
              onChange={(value) => updateField("title", value)}
              error={fieldErrors.title}
              placeholder="Get in touch"
            />
          </div>

          <TextAreaField
            layout="grid"
            label="Intro description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            rows={4}
            placeholder="Tell visitors when they should reach out and what kinds of questions they can ask."
          />
        </SectionCard>

        <SectionCard
          sectionClassName="pb-4"
          title="Details panel"
          description="Control the copy around the contact details cards on the left side of the page."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              layout="grid"
              label="Details title"
              value={form.detailsTitle}
              onChange={(value) => updateField("detailsTitle", value)}
              error={fieldErrors.detailsTitle}
            />
            <TextField
              layout="grid"
              label="Best-for title"
              value={form.bestForTitle}
              onChange={(value) => updateField("bestForTitle", value)}
              error={fieldErrors.bestForTitle}
            />
          </div>

          <TextAreaField
            layout="grid"
            label="Details description"
            value={form.detailsDescription}
            onChange={(value) => updateField("detailsDescription", value)}
            error={fieldErrors.detailsDescription}
            rows={3}
          />

          <TextAreaField
            layout="grid"
            label="Best-for description"
            value={form.bestForDescription}
            onChange={(value) => updateField("bestForDescription", value)}
            error={fieldErrors.bestForDescription}
            rows={4}
          />

          <TextAreaField
            layout="grid"
            label="Closing note"
            value={form.closingNote}
            onChange={(value) => updateField("closingNote", value)}
            rows={3}
            placeholder="Optional note shown below the public contact cards."
          />
        </SectionCard>

        <SectionCard
          sectionClassName="pb-4"
          title="Message panel"
          description="Edit the form-side copy and the fallback text used when no public contact details are shown."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              layout="grid"
              label="Message title"
              value={form.messageTitle}
              onChange={(value) => updateField("messageTitle", value)}
              error={fieldErrors.messageTitle}
            />
            <TextField
              layout="grid"
              label="Submit button label"
              value={form.submitButtonLabel}
              onChange={(value) => updateField("submitButtonLabel", value)}
              error={fieldErrors.submitButtonLabel}
            />
          </div>

          <TextAreaField
            layout="grid"
            label="Message description"
            value={form.messageDescription}
            onChange={(value) => updateField("messageDescription", value)}
            error={fieldErrors.messageDescription}
            rows={3}
          />

          <TextAreaField
            layout="grid"
            label="Empty-details fallback"
            value={form.emptyDetailsMessage}
            onChange={(value) => updateField("emptyDetailsMessage", value)}
            error={fieldErrors.emptyDetailsMessage}
            rows={4}
          />
        </SectionCard>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleSave()}
            disabled={!hasChanges || saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <aside className="rounded-2xl border border-base-300 bg-base-200/35 p-5 mt-5 mr-5 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-base-content">
            Live snapshot
          </h4>
          <p className="text-sm text-base-content/65">
            Preview the current contact page copy, visible details, and form
            routing before you save.
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
          <div className="border-b border-base-300 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
              {previewEyebrow}
            </p>
            <p className="mt-2 text-lg font-semibold text-base-content">
              {previewTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-base-content/70">
              {previewDescription ||
                "Add an intro description for the contact page."}
            </p>
          </div>

          <div className="space-y-4 px-4 py-4 text-sm">
            <PreviewRow
              label="Visible email"
              value={
                form.showContactEmail
                  ? previewResolvedEmail || "Add a public contact email"
                  : "Hidden"
              }
            />
            <PreviewRow
              label="Visible phone"
              value={
                form.showSupportPhone
                  ? normalizeOptionalString(form.supportPhone) ||
                    "Add a support phone number"
                  : "Hidden"
              }
            />
            <PreviewRow
              label="Visible address"
              value={
                form.showAddress
                  ? previewAddressLines.join(", ") || "Add a business address"
                  : "Hidden"
              }
            />
            <PreviewRow
              label="Visible hours"
              value={
                form.showBusinessHours
                  ? normalizeOptionalString(form.businessHours) ||
                    "Add support hours"
                  : "Hidden"
              }
              multiline
            />
            <PreviewRow
              label="Form receiver"
              value={
                normalizeOptionalString(form.contactReceiverEmail) ||
                "Falls back to backend contact receiver"
              }
            />
            <PreviewRow
              label="Submit button"
              value={form.submitButtonLabel.trim() || "Send"}
            />
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm text-base-content/80">
          <div>
            <p className="font-medium text-base-content">Last updated</p>
            <p>
              {formatStoreCustomizationDateTime(
                contactPage.updatedAt ??
                  settings.updatedAt ??
                  contactPage.createdAt ??
                  settings.createdAt ??
                  undefined,
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-base-content">Token help</p>
            <p className="leading-6">
              Use <code>{"{{siteName}}"}</code> and{" "}
              <code>{"{{contactEmail}}"}</code> in the public copy when you want
              those values inserted automatically.
            </p>
          </div>
          <div>
            <p className="font-medium text-base-content">Routing note</p>
            <p className="leading-6">
              The receiver email is private. It changes where form submissions
              go, not what visitors see on the public page.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

