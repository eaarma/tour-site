import { ArrowDown, ArrowUp, CopyPlus, Trash2 } from "lucide-react";

import type {
  FaqPageForm,
  PageFieldErrors,
  StorePageEditorUpdateForm,
} from "@/types";
import { createEmptyFaqItem } from "@/types/storePageEditor";

import FormCard from "./FormCard";
import IconButton from "./IconButton";
import TextAreaField from "./TextAreaField";
import TextField from "./TextField";

type FaqEditorProps = {
  form: FaqPageForm;
  fieldErrors: PageFieldErrors;
  updateForm: StorePageEditorUpdateForm;
};

export default function FaqEditor({
  form,
  fieldErrors,
  updateForm,
}: FaqEditorProps) {
  return (
    <FormCard
      title="FAQ items"
      description="Edit the public questions and answers shown on the FAQ page."
    >
      <div className="space-y-4">
        {fieldErrors.items ? (
          <div className="rounded-xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
            {fieldErrors.items}
          </div>
        ) : null}

        {form.items.map((item, index) => (
          <div
            key={`faq-item-${index}`}
            className="rounded-2xl border border-base-300 bg-base-200/35 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-base-content">
                  FAQ item {index + 1}
                </p>
                <p className="mt-1 text-sm text-base-content/60">
                  Keep the question short and the answer direct.
                </p>
              </div>

              <div className="flex items-center gap-1">
                <IconButton
                  label="Move up"
                  disabled={index === 0}
                  onClick={() =>
                    updateForm((currentForm) => {
                      const items = [...(currentForm as FaqPageForm).items];
                      const [movedItem] = items.splice(index, 1);
                      items.splice(index - 1, 0, movedItem);
                      return {
                        ...(currentForm as FaqPageForm),
                        items,
                      };
                    })
                  }
                >
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Move down"
                  disabled={index === form.items.length - 1}
                  onClick={() =>
                    updateForm((currentForm) => {
                      const items = [...(currentForm as FaqPageForm).items];
                      const [movedItem] = items.splice(index, 1);
                      items.splice(index + 1, 0, movedItem);
                      return {
                        ...(currentForm as FaqPageForm),
                        items,
                      };
                    })
                  }
                >
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Remove item"
                  disabled={form.items.length === 1}
                  onClick={() =>
                    updateForm((currentForm) => ({
                      ...(currentForm as FaqPageForm),
                      items: (currentForm as FaqPageForm).items.filter(
                        (_item, itemIndex) => itemIndex !== index,
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
                label="Question"
                value={item.question}
                onChange={(value) =>
                  updateForm((currentForm) => ({
                    ...(currentForm as FaqPageForm),
                    items: (currentForm as FaqPageForm).items.map(
                      (currentItem, itemIndex) =>
                        itemIndex === index
                          ? { ...currentItem, question: value }
                          : currentItem,
                    ),
                  }))
                }
                error={fieldErrors[`items.${index}.question`]}
              />

              <TextAreaField
                label="Answer"
                value={item.answer}
                onChange={(value) =>
                  updateForm((currentForm) => ({
                    ...(currentForm as FaqPageForm),
                    items: (currentForm as FaqPageForm).items.map(
                      (currentItem, itemIndex) =>
                        itemIndex === index
                          ? { ...currentItem, answer: value }
                          : currentItem,
                    ),
                  }))
                }
                error={fieldErrors[`items.${index}.answer`]}
                rows={5}
                placeholder="Use blank lines for multiple paragraphs."
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-outline"
          onClick={() =>
            updateForm((currentForm) => ({
              ...(currentForm as FaqPageForm),
              items: [
                ...(currentForm as FaqPageForm).items,
                createEmptyFaqItem(),
              ],
            }))
          }
        >
          <CopyPlus className="h-4 w-4" />
          Add FAQ item
        </button>
      </div>
    </FormCard>
  );
}
