export type StorePageSlug = "faq" | "privacy" | "terms" | "refund" | "contact";

export type PolicySectionDto = {
  title?: string | null;
  body?: string | null;
};

export type PolicyPageContentDto = {
  sections?: PolicySectionDto[];
};

export type FaqItemDto = {
  question?: string | null;
  answer?: string | null;
};

export type FaqPageContentDto = {
  items?: FaqItemDto[];
};

export type ContactPageContentDto = {
  detailsTitle?: string | null;
  detailsDescription?: string | null;
  bestForTitle?: string | null;
  bestForDescription?: string | null;
  messageTitle?: string | null;
  messageDescription?: string | null;
  emptyDetailsMessage?: string | null;
  submitButtonLabel?: string | null;
};

export type StorePageContentDto =
  | FaqPageContentDto
  | PolicyPageContentDto
  | ContactPageContentDto;

export type StorePageContentBySlug = {
  faq: FaqPageContentDto;
  privacy: PolicyPageContentDto;
  terms: PolicyPageContentDto;
  refund: PolicyPageContentDto;
  contact: ContactPageContentDto;
};

export type StorePageDto<TContent = StorePageContentDto> = {
  id: number | null;
  slug: StorePageSlug;
  eyebrow: string;
  title: string;
  description: string | null;
  contentJson: TContent;
  closingNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UpdateStorePageRequestDto<TContent = StorePageContentDto> = {
  eyebrow: string;
  title: string;
  description: string | null;
  contentJson: TContent;
  closingNote: string | null;
};
