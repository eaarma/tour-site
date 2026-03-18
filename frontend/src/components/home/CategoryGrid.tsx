"use client";

import { Tour } from "@/types";
import CategoryGridItem from "./CategoryGridItem";

interface Props {
  title: string;
  items: Tour[];
}

export default function CategoryGrid({ title, items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-2xl font-bold">{title}</h2>

      <div className="grid grid-cols-2 gap-4">
        {items.slice(0, 4).map((item) => (
          <CategoryGridItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
