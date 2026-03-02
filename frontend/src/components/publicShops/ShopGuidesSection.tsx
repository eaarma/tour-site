"use client";

import { ShopUserDto } from "@/types";
import { User, Mail, Phone } from "lucide-react";
import Badge from "@/components/common/Badge";
import { FaUserCircle } from "react-icons/fa";

interface Props {
  guides: ShopUserDto[];
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
          {guides.map((guide) => (
            <div
              key={guide.userId}
              className="group relative flex flex-col gap-4 rounded-xl border border-base-300 bg-card p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-full bg-muted shrink-0">
                  <FaUserCircle className="size-10 text-muted-foreground text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-card-foreground truncate">
                    {guide.userName}
                  </p>

                  <Badge
                    variant="outline"
                    className="text-[11px] px-2 py-0 font-medium mt-1"
                  >
                    {formatRole(guide.role)}
                  </Badge>
                </div>
              </div>

              {/* Contact (optional display – can remove later) */}
              <div className="flex flex-col gap-2 text-sm text-muted-foreground ml-2">
                {guide.userEmail && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="size-3.5 shrink-0" />
                    <span className="truncate">{guide.userEmail}</span>
                  </div>
                )}

                {guide.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{guide.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
