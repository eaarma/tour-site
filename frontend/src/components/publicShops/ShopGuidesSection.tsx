"use client";

import { ShopUserDto } from "@/types";

interface Props {
  guides: ShopUserDto[];
}

export default function ShopGuidesSection({ guides }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Guides</h2>

      {guides.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No active guides available.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <div
              key={guide.userId}
              className="border border-base-300 rounded-xl p-4 bg-base-100"
            >
              <div className="font-medium">{guide.userName}</div>

              <div className="text-sm text-muted-foreground">{guide.role}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
