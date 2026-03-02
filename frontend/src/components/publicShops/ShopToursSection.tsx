"use client";

interface Props {
  shopId: number;
}

export default function ShopToursSection({ shopId }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Tours Offered</h2>

      <div className="border border-dashed border-base-300 rounded-xl p-6 text-muted-foreground text-sm">
        Tours for shop ID {shopId} will be displayed here.
      </div>
    </section>
  );
}
