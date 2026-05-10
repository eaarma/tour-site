"use client";

import { ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { ShopDto } from "@/types/shop";

interface Props {
  shops: ShopDto[];
  loading: boolean;
}

export default function ManagerProfileShopsSection({ shops, loading }: Props) {
  const router = useRouter();

  const formatDate = (value?: string) =>
    value
      ? new Intl.DateTimeFormat(undefined, {
          month: "short",
          year: "numeric",
        }).format(new Date(value))
      : "Unknown";

  if (loading) {
    return (
      <section className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
          Shops
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-base-content">
          Your Shops
        </h2>
        <div className="mt-6 rounded-2xl border border-base-300 bg-base-100 p-8 text-center">
          <span className="loading loading-spinner loading-md text-primary" />
          <p className="mt-4 text-sm text-base-content/60">Loading shops...</p>
        </div>
      </section>
    );
  }

  if (shops.length === 0) {
    return (
      <section className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
          Shops
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-base-content">
          Your Shops
        </h2>
        <div className="mt-6 rounded-2xl border border-dashed border-base-300 bg-base-200/25 p-8 text-center">
          <p className="text-sm text-base-content/60">
            No shops are associated with your account yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
        Shops
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-base-content">
        Your Shops
      </h3>
      <p className="mt-2 text-sm leading-6 text-base-content/60">
        Open a shop workspace to manage tours, staff, and store details.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="rounded-2xl border border-base-300 bg-base-100 p-5 transition hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="badge badge-outline border-base-300 bg-base-100 capitalize text-base-content">
                {shop.status.toLowerCase()}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-base-content">
              {shop.name}
            </h2>

            <p className="mt-1 text-sm text-base-content/55">
              Shop ID: {shop.id}
            </p>
            <p className="mt-1 text-sm text-base-content/55">
              Created {formatDate(shop.createdAt)}
            </p>

            <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-base-content/65">
              {shop.description?.trim() || "No shop description added yet."}
            </p>

            <button
              className="btn btn-outline btn-sm mt-4 gap-2"
              onClick={() => router.push(`/shops/manager?shopId=${shop.id}`)}
            >
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
