"use client";

import { ShopDto } from "@/types/shop";

interface Props {
  shop: ShopDto;
}

export default function ShopHeaderSection({ shop }: Props) {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl sm:text-4xl font-bold">{shop.name}</h1>

      {shop.description && (
        <p className="text-muted-foreground max-w-3xl">{shop.description}</p>
      )}

      <div className="text-sm text-muted-foreground">
        Established {shop.createdAt}
      </div>
    </section>
  );
}
