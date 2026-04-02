"use client";

import { PublicShopUserDto } from "@/types";
import Badge from "@/components/common/Badge";
import { FaUserCircle } from "react-icons/fa";

interface Props {
  guides: PublicShopUserDto[];
}

function formatRole(role: string) {
  return role
    ?.toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ShopGuidesSection({ guides }: Props) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Guides</h2>

      {guides.length === 0 ? (
        <div className="rounded-xl border border-base-300 bg-card p-6 text-sm text-muted-foreground">
          No active guides available.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, index) => (
            <div
              key={`${guide.userName}-${guide.role}-${index}`}
              className="group relative flex flex-col gap-4 rounded-xl border border-base-300 bg-card p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-full bg-muted shrink-0">
                  <FaUserCircle className="size-10 text-muted-foreground text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-card-foreground truncate">
                    {guide.userName || "Team member"}
                  </p>

                  <Badge
                    variant="outline"
                    className="text-[11px] px-2 py-0 font-medium mt-1"
                  >
                    {formatRole(guide.role)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
