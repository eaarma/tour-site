import { ArrowDown, ArrowUp, CopyPlus, Trash2 } from "lucide-react";

import type {
  PageFieldErrors,
  PolicyPageForm,
  StorePageEditorUpdateForm,
} from "@/types";
import { createEmptyPolicySection } from "@/types/storePageEditor";

import FormCard from "./FormCard";
import IconButton from "./IconButton";
import TextAreaField from "./TextAreaField";
import TextField from "./TextField";

type PolicyEditorProps = {
  form: PolicyPageForm;
  fieldErrors: PageFieldErrors;
  updateForm: StorePageEditorUpdateForm;
};

export default function PolicyEditor({
  form,
  fieldErrors,
  updateForm,
}: PolicyEditorProps) {
  return (
    <FormCard
      title="Policy sections"
      description="Edit each section title and body. Use blank lines for paragraphs and `- ` for bullet lists."
    >
      <div className="space-y-4">
        {fieldErrors.sections ? (
          <div className="rounded-xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
            {fieldErrors.sections}
          </div>
        ) : null}

        {form.sections.map((section, index) => (
          <div
            key={`policy-section-${index}`}
            className="rounded-2xl border border-base-300 bg-base-200/35 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-base-content">
                  Section {index + 1}
                </p>
                <p className="mt-1 text-sm text-base-content/60">
                  Each section supports paragraphs and bullet lists in plain
                  text.
                </p>
              </div>

              <div className="flex items-center gap-1">
                <IconButton
                  label="Move up"
                  disabled={index === 0}
                  onClick={() =>
                    updateForm((currentForm) => {
                      const sections = [
                        ...(currentForm as PolicyPageForm).sections,
                      ];
                      const [movedSection] = sections.splice(index, 1);
                      sections.splice(index - 1, 0, movedSection);
                      return {
                        ...(currentForm as PolicyPageForm),
                        sections,
                      };
                    })
                  }
                >
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Move down"
                  disabled={index === form.sections.length - 1}
                  onClick={() =>
                    updateForm((currentForm) => {
                      const sections = [
                        ...(currentForm as PolicyPageForm).sections,
                      ];
                      const [movedSection] = sections.splice(index, 1);
                      sections.splice(index + 1, 0, movedSection);
                      return {
                        ...(currentForm as PolicyPageForm),
                        sections,
                      };
                    })
                  }
                >
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Remove section"
                  disabled={form.sections.length === 1}
                  onClick={() =>
                    updateForm((currentForm) => ({
                      ...(currentForm as PolicyPageForm),
                      sections: (currentForm as PolicyPageForm).sections.filter(
                        (_section, sectionIndex) => sectionIndex !== index,
                      ),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <TextField
                label="Section title"
                value={section.title}
                onChange={(value) =>
                  updateForm((currentForm) => ({
                    ...(currentForm as PolicyPageForm),
                    sections: (currentForm as PolicyPageForm).sections.map(
                      (currentSection, sectionIndex) =>
                        sectionIndex === index
                          ? { ...currentSection, title: value }
                          : currentSection,
                    ),
                  }))
                }
                error={fieldErrors[`sections.${index}.title`]}
              />

              <TextAreaField
                label="Section body"
                value={section.body}
                onChange={(value) =>
                  updateForm((currentForm) => ({
                    ...(currentForm as PolicyPageForm),
                    sections: (currentForm as PolicyPageForm).sections.map(
                      (currentSection, sectionIndex) =>
                        sectionIndex === index
                          ? { ...currentSection, body: value }
                          : currentSection,
                    ),
                  }))
                }
                error={fieldErrors[`sections.${index}.body`]}
                rows={7}
                placeholder="Use blank lines for paragraphs and `- ` for bullets."
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-outline"
          onClick={() =>
            updateForm((currentForm) => ({
              ...(currentForm as PolicyPageForm),
              sections: [
                ...(currentForm as PolicyPageForm).sections,
                createEmptyPolicySection(),
              ],
            }))
          }
        >
          <CopyPlus className="h-4 w-4" />
          Add section
        </button>
      </div>
    </FormCard>
  );
}
