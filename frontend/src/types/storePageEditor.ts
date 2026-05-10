import type { StorePageSlug } from "./storePage";

export type PolicySectionForm = {
  title: string;
  body: string;
};

export type FaqItemForm = {
  question: string;
  answer: string;
};

type BaseStorePageForm = {
  slug: StorePageSlug;
  eyebrow: string;
  title: string;
  description: string;
  closingNote: string;
};

export type PolicyPageForm = BaseStorePageForm & {
  kind: "policy";
  sections: PolicySectionForm[];
};

export type FaqPageForm = BaseStorePageForm & {
  kind: "faq";
  items: FaqItemForm[];
};

export type StorePageEditorForm = PolicyPageForm | FaqPageForm;

export type PageFieldErrors = Partial<Record<string, string>>;

export type StorePageEditorUpdateForm = (
  updater: (currentForm: StorePageEditorForm) => StorePageEditorForm,
) => void;

export const createEmptyPolicySection = (): PolicySectionForm => ({
  title: "",
  body: "",
});

export const createEmptyFaqItem = (): FaqItemForm => ({
  question: "",
  answer: "",
});
