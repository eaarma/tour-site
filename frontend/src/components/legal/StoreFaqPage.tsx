import LegalPageShell from "@/components/legal/LegalPageShell";
import StorePageRichText from "@/components/legal/StorePageRichText";
import { formatStorePageUpdatedLabel } from "@/lib/storefront/storePageDefaults";
import type { FaqPageContentDto, StorePageDto } from "@/types/storePage";

export default function StoreFaqPage({
  page,
}: {
  page: StorePageDto<FaqPageContentDto>;
}) {
  const items = page.contentJson.items ?? [];

  return (
    <LegalPageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description ? <p>{page.description}</p> : undefined}
      meta={<p>Last updated: {formatStorePageUpdatedLabel(page.updatedAt)}</p>}
      footer={page.closingNote ? <p>{page.closingNote}</p> : undefined}
    >
      <section className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item.question}-${index}`}
            className="collapse collapse-arrow rounded-2xl border border-base-300 bg-base-100 shadow-sm"
          >
            <input type="checkbox" defaultChecked={index === 0} />
            <div className="collapse-title text-lg font-semibold text-base-content">
              {item.question}
            </div>
            <div className="collapse-content">
              <StorePageRichText text={item.answer ?? ""} />
            </div>
          </div>
        ))}
      </section>
    </LegalPageShell>
  );
}

