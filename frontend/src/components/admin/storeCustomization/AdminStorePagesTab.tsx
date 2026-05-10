"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

import { StorePageService } from "@/lib/storefront/storePageService";
import { normalizeStorePage } from "@/lib/storefront/storePageDefaults";
import type {
  FaqPageContentDto,
  PageFieldErrors,
  PolicyPageContentDto,
  PolicyPageForm,
  FaqPageForm,
  StorePageEditorForm,
  StorePageDto,
  StorePageEditorUpdateForm,
  StorePageSlug,
  UpdateStorePageRequestDto,
} from "@/types";
import {
  createEmptyFaqItem,
  createEmptyPolicySection,
} from "@/types/storePageEditor";

import {
  formatStoreCustomizationDateTime,
  type StoreCustomizationTabProps,
} from "./storeCustomizationHeader";
import FaqEditor from "./components/FaqEditor";
import FormCard from "./components/FormCard";
import PolicyEditor from "./components/PolicyEditor";
import SummaryRow from "./components/SummaryRow";
import TextAreaField from "./components/TextAreaField";
import TextField from "./components/TextField";

type ManagedPageKind = "faq" | "policy";

type ManagedPageSpec = {
  slug: StorePageSlug;
  label: string;
  kind: ManagedPageKind;
  summary: string;
};

type PageMap = Partial<Record<StorePageSlug, StorePageDto>>;
type PageFormMap = Partial<Record<StorePageSlug, StorePageEditorForm>>;

const MANAGED_PAGE_SPECS: ManagedPageSpec[] = [
  {
    slug: "faq",
    label: "FAQ",
    kind: "faq",
    summary:
      "Questions, answers, and help-center copy for the public FAQ page.",
  },
  {
    slug: "privacy",
    label: "Privacy",
    kind: "policy",
    summary: "Privacy policy heading copy and structured legal sections.",
  },
  {
    slug: "terms",
    label: "Terms",
    kind: "policy",
    summary: "Terms & Conditions heading copy and section content.",
  },
  {
    slug: "refund",
    label: "Cancellation",
    kind: "policy",
    summary:
      "Cancellation and refund policy sections shown on the public legal page.",
  },
] as const;

const getPageSpec = (slug: StorePageSlug) =>
  MANAGED_PAGE_SPECS.find((page) => page.slug === slug) ??
  MANAGED_PAGE_SPECS[0];

const serializePageForm = (form: StorePageEditorForm) => JSON.stringify(form);

const normalizeOptionalString = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const toFaqPageForm = (page: StorePageDto): FaqPageForm => ({
  kind: "faq",
  slug: "faq",
  eyebrow: page.eyebrow,
  title: page.title,
  description: page.description ?? "",
  closingNote: page.closingNote ?? "",
  items:
    page.slug === "faq"
      ? (((page.contentJson as FaqPageContentDto).items ?? []).map((item) => ({
          question: item.question ?? "",
          answer: item.answer ?? "",
        })) as FaqPageForm["items"])
      : [createEmptyFaqItem()],
});

const toPolicyPageForm = (page: StorePageDto): PolicyPageForm => ({
  kind: "policy",
  slug: page.slug,
  eyebrow: page.eyebrow,
  title: page.title,
  description: page.description ?? "",
  closingNote: page.closingNote ?? "",
  sections:
    page.slug !== "faq"
      ? (((page.contentJson as PolicyPageContentDto).sections ?? []).map(
          (section) => ({
            title: section.title ?? "",
            body: section.body ?? "",
          }),
        ) as PolicyPageForm["sections"])
      : [createEmptyPolicySection()],
});

const toEditorForm = (page: StorePageDto, kind: ManagedPageKind) => {
  if (kind === "faq") {
    return toFaqPageForm(page);
  }

  return toPolicyPageForm(page);
};

function validatePageForm(form: StorePageEditorForm): PageFieldErrors {
  const errors: PageFieldErrors = {};

  if (!form.eyebrow.trim()) {
    errors.eyebrow = "Eyebrow is required.";
  }

  if (!form.title.trim()) {
    errors.title = "Page title is required.";
  }

  if (form.kind === "faq") {
    if (form.items.length === 0) {
      errors.items = "Add at least one FAQ item.";
    }

    form.items.forEach((item, index) => {
      if (!item.question.trim()) {
        errors[`items.${index}.question`] = "Question is required.";
      }

      if (!item.answer.trim()) {
        errors[`items.${index}.answer`] = "Answer is required.";
      }
    });

    return errors;
  }

  if (form.sections.length === 0) {
    errors.sections = "Add at least one section.";
  }

  form.sections.forEach((section, index) => {
    if (!section.title.trim()) {
      errors[`sections.${index}.title`] = "Section title is required.";
    }

    if (!section.body.trim()) {
      errors[`sections.${index}.body`] = "Section body is required.";
    }
  });

  return errors;
}

function buildUpdatePayload(
  form: StorePageEditorForm,
): UpdateStorePageRequestDto {
  if (form.kind === "faq") {
    return {
      eyebrow: form.eyebrow.trim(),
      title: form.title.trim(),
      description: normalizeOptionalString(form.description),
      contentJson: {
        items: form.items.map((item) => ({
          question: normalizeOptionalString(item.question),
          answer: normalizeOptionalString(item.answer),
        })),
      },
      closingNote: normalizeOptionalString(form.closingNote),
    };
  }

  return {
    eyebrow: form.eyebrow.trim(),
    title: form.title.trim(),
    description: normalizeOptionalString(form.description),
    contentJson: {
      sections: form.sections.map((section) => ({
        title: normalizeOptionalString(section.title),
        body: normalizeOptionalString(section.body),
      })),
    },
    closingNote: normalizeOptionalString(form.closingNote),
  };
}

export default function AdminStorePagesTab({
  onHeaderMetaChange,
}: StoreCustomizationTabProps) {
  const [activeSlug, setActiveSlug] = useState<StorePageSlug>("faq");
  const [pagesBySlug, setPagesBySlug] = useState<PageMap>({});
  const [initialFormsBySlug, setInitialFormsBySlug] = useState<PageFormMap>({});
  const [formsBySlug, setFormsBySlug] = useState<PageFormMap>({});
  const [fieldErrors, setFieldErrors] = useState<PageFieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyLoadedPages = useCallback((pages: StorePageDto[]) => {
    const nextPagesBySlug: PageMap = {};
    const nextFormsBySlug: PageFormMap = {};

    MANAGED_PAGE_SPECS.forEach((spec) => {
      const normalizedPage = normalizeStorePage(
        spec.slug,
        pages.find((page) => page.slug === spec.slug),
      );

      nextPagesBySlug[spec.slug] = normalizedPage;
      nextFormsBySlug[spec.slug] = toEditorForm(normalizedPage, spec.kind);
    });

    setPagesBySlug(nextPagesBySlug);
    setFormsBySlug(nextFormsBySlug);
    setInitialFormsBySlug(nextFormsBySlug);
    setFieldErrors({});
    setActiveSlug((currentSlug) =>
      nextPagesBySlug[currentSlug] ? currentSlug : "faq",
    );
  }, []);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pages = await StorePageService.getPages();
      applyLoadedPages(pages);
    } catch (loadError) {
      console.error(loadError);
      setError("Could not load the editable store pages.");
    } finally {
      setLoading(false);
    }
  }, [applyLoadedPages]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  const dirtySlugs = useMemo(
    () =>
      MANAGED_PAGE_SPECS.flatMap((spec) => {
        const currentForm = formsBySlug[spec.slug];
        const initialForm = initialFormsBySlug[spec.slug];

        if (!currentForm || !initialForm) {
          return [];
        }

        return serializePageForm(currentForm) !== serializePageForm(initialForm)
          ? [spec.slug]
          : [];
      }),
    [formsBySlug, initialFormsBySlug],
  );

  const activeSpec = getPageSpec(activeSlug);
  const activePage = pagesBySlug[activeSlug] ?? null;
  const activeForm = formsBySlug[activeSlug] ?? null;
  const activeInitialForm = initialFormsBySlug[activeSlug] ?? null;
  const hasUnsavedChanges = dirtySlugs.length > 0;
  const activePageDirty = dirtySlugs.includes(activeSlug);

  useEffect(() => {
    onHeaderMetaChange?.({
      statusBadgeClassName: hasUnsavedChanges
        ? "badge-warning badge-outline"
        : "badge-success badge-outline",
      statusBadgeLabel: hasUnsavedChanges
        ? `${dirtySlugs.length} unsaved page${dirtySlugs.length === 1 ? "" : "s"}`
        : "Saved",
      lastUpdatedLabel: activePage?.updatedAt
        ? `Last updated ${formatStoreCustomizationDateTime(activePage.updatedAt)}`
        : activePage?.createdAt
          ? `Created ${formatStoreCustomizationDateTime(activePage.createdAt)}`
          : "Using default legal page content",
    });
  }, [
    activePage?.createdAt,
    activePage?.updatedAt,
    dirtySlugs.length,
    hasUnsavedChanges,
    onHeaderMetaChange,
  ]);

  const updateActiveForm: StorePageEditorUpdateForm = (updater) => {
    setFormsBySlug((current) => {
      const currentForm = current[activeSlug];

      if (!currentForm) {
        return current;
      }

      return {
        ...current,
        [activeSlug]: updater(currentForm),
      };
    });

    setFieldErrors({});
    setError(null);
  };

  const handleReset = () => {
    if (!activeInitialForm) {
      return;
    }

    setFormsBySlug((current) => ({
      ...current,
      [activeSlug]: activeInitialForm,
    }));
    setFieldErrors({});
    setError(null);
  };

  const handleSave = async () => {
    if (!activeForm) {
      return;
    }

    const nextErrors = validatePageForm(activeForm);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted page fields before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedPage = normalizeStorePage(
        activeSlug,
        await StorePageService.updatePage(
          activeSlug,
          buildUpdatePayload(activeForm),
        ),
      );
      const nextForm = toEditorForm(updatedPage, activeSpec.kind);

      setPagesBySlug((current) => ({
        ...current,
        [activeSlug]: updatedPage,
      }));
      setFormsBySlug((current) => ({
        ...current,
        [activeSlug]: nextForm,
      }));
      setInitialFormsBySlug((current) => ({
        ...current,
        [activeSlug]: nextForm,
      }));
      setFieldErrors({});
      toast.success(`${activeSpec.label} page updated.`);
    } catch (saveError) {
      console.error(saveError);
      setError(`Could not save the ${activeSpec.label.toLowerCase()} page.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-10 m-4 text-sm text-base-content/60">
        Loading editable store pages...
      </div>
    );
  }

  if (!activePage || !activeForm) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-6">
        <p className="text-sm text-error">
          {error ?? "Could not load the store pages."}
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm mt-4"
          onClick={() => void loadPages()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="border-b border-base-300 p-4 pt-4 sm:p-4 sm:pt-4 mb-4">
        <label className="form-control sm:hidden">
          <span className="label-text mb-1">Page</span>
          <select
            className="select select-bordered w-full"
            value={activeSlug}
            onChange={(event) => {
              setActiveSlug(event.target.value as StorePageSlug);
              setFieldErrors({});
              setError(null);
            }}
          >
            {MANAGED_PAGE_SPECS.map((page) => (
              <option key={page.slug} value={page.slug}>
                {page.label}
              </option>
            ))}
          </select>
        </label>

        <div className="hidden flex-wrap gap-2 sm:flex">
          {MANAGED_PAGE_SPECS.map((page) => {
            const isActive = activeSlug === page.slug;
            const isDirty = dirtySlugs.includes(page.slug);

            return (
              <button
                key={page.slug}
                type="button"
                className={`btn h-auto min-h-0 rounded-full px-4 py-2 ${
                  isActive ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => {
                  setActiveSlug(page.slug);
                  setFieldErrors({});
                  setError(null);
                }}
              >
                <span>{page.label}</span>
                {isDirty ? (
                  <span className="badge badge-warning badge-xs">Unsaved</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {error ? (
            <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          ) : null}

          <FormCard
            title={`${activeSpec.label} page`}
            description={activeSpec.summary}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Eyebrow"
                value={activeForm.eyebrow}
                onChange={(value) =>
                  updateActiveForm((currentForm) => ({
                    ...currentForm,
                    eyebrow: value,
                  }))
                }
                error={fieldErrors.eyebrow}
              />
              <TextField
                label="Page title"
                value={activeForm.title}
                onChange={(value) =>
                  updateActiveForm((currentForm) => ({
                    ...currentForm,
                    title: value,
                  }))
                }
                error={fieldErrors.title}
              />
            </div>

            <TextAreaField
              label="Intro / description"
              value={activeForm.description}
              onChange={(value) =>
                updateActiveForm((currentForm) => ({
                  ...currentForm,
                  description: value,
                }))
              }
              rows={4}
              placeholder="Optional page intro shown below the title."
            />

            <TextAreaField
              label="Closing note"
              value={activeForm.closingNote}
              onChange={(value) =>
                updateActiveForm((currentForm) => ({
                  ...currentForm,
                  closingNote: value,
                }))
              }
              rows={3}
              placeholder="Optional footer note for the bottom of the page."
            />
          </FormCard>

          {activeForm.kind === "faq" ? (
            <FaqEditor
              form={activeForm}
              fieldErrors={fieldErrors}
              updateForm={updateActiveForm}
            />
          ) : (
            <PolicyEditor
              form={activeForm}
              fieldErrors={fieldErrors}
              updateForm={updateActiveForm}
            />
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
              disabled={!activePageDirty || saving}
            >
              Reset changes
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleSave()}
              disabled={!activePageDirty || saving}
            >
              {saving ? "Saving..." : `Save ${activeSpec.label}`}
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Page snapshot
            </p>
            <h5 className="mt-2 text-lg font-semibold text-base-content">
              {activeSpec.label}
            </h5>
            <p className="mt-2 text-sm leading-6 text-base-content/65">
              {activeSpec.summary}
            </p>

            <div className="mt-5 space-y-3 text-sm text-base-content/70">
              <SummaryRow label="Slug" value={activeSlug} />
              <SummaryRow
                label="Unsaved"
                value={activePageDirty ? "Yes" : "No"}
              />
              <SummaryRow
                label="Last updated"
                value={formatStoreCustomizationDateTime(
                  activePage.updatedAt ?? undefined,
                )}
              />
              <SummaryRow
                label="Structure"
                value={describeFormStructure(activeForm)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <p className="text-sm font-semibold text-base-content">
              Formatting help
            </p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-base-content/65">
              <p>Use blank lines to split paragraphs inside section bodies.</p>
              <p>Start lines with `- ` to turn them into bullet lists.</p>
              <p>
                Use <code>{"{{contactEmail}}"}</code> anywhere you want the
                current storefront contact email inserted automatically.
              </p>
              <p>
                Use <code>{"{{siteName}}"}</code> when you want the current
                storefront name inserted automatically.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <p className="text-sm font-semibold text-base-content">
              Default content source
            </p>
            <p className="mt-2 text-sm leading-6 text-base-content/60">
              These editors start from the current live FAQ, terms, privacy, and
              cancellation page copy, so you can refine what is already there
              instead of rebuilding from scratch.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function describeFormStructure(form: StorePageEditorForm) {
  if (form.kind === "faq") {
    return `${form.items.length} FAQ item${form.items.length === 1 ? "" : "s"}`;
  }

  return `${form.sections.length} section${form.sections.length === 1 ? "" : "s"}`;
}

