"use client";

import { Tour } from "@/types";
import ItemCard from "../items/ItemCard";

interface Props {
  shopId: number;
  tours: Tour[];
}

export default function ShopToursSection({ tours }: Props) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Tours Offered</h2>

      {tours.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          This shop has not published any tours yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tours.map((tour) => (
            <ItemCard key={tour.id} item={tour} href={`/tours/${tour.id}`} />
          ))}
        </div>
      )}
    </section>
  );
}
