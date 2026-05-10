import LegalPageShell from "@/components/legal/LegalPageShell";
import StorePageRichText from "@/components/legal/StorePageRichText";
import { formatStorePageUpdatedLabel } from "@/lib/storefront/storePageDefaults";
import type {
  PolicyPageContentDto,
  StorePageDto,
} from "@/types/storePage";

export default function StorePolicyPage({
  page,
}: {
  page: StorePageDto<PolicyPageContentDto>;
}) {
  const sections = page.contentJson.sections ?? [];

  return (
    <LegalPageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description ? <p>{page.description}</p> : undefined}
      meta={<p>Last updated: {formatStorePageUpdatedLabel(page.updatedAt)}</p>}
      footer={page.closingNote ? <p>{page.closingNote}</p> : undefined}
    >
      <section className="space-y-6">
        {sections.map((section, index) => (
          <div key={`${section.title}-${index}`}>
            <h2 className="text-xl font-semibold text-base-content">
              {section.title}
            </h2>
            <div className="mt-2">
              <StorePageRichText text={section.body ?? ""} />
            </div>
          </div>
        ))}
      </section>
    </LegalPageShell>
  );
}

