"use client";

import HomeSectionHeading from "./HomeSectionHeading";
import TourCollectionGridItem from "./TourCollectionGridItem";

export interface TourCollectionShowcaseItem {
  title: string;
  eyebrow: string;
  description?: string;
  note: string;
  href: string;
  imageUrl: string | null;
  accentClassName?: string;
}

type Props = {
  title?: string;
  items: TourCollectionShowcaseItem[];
};

export default function TourCollectionGrid({ title, items }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      {title ? <HomeSectionHeading title={title} /> : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {items.slice(0, 4).map((item) => (
          <TourCollectionGridItem
            key={`${item.title}-${item.eyebrow}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}
