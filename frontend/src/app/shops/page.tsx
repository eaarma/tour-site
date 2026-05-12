"use client";

import { useCallback, useEffect, useState } from "react";
import { ShopUserService } from "@/lib/shops/shopUserService";
import { ShopService } from "@/lib/shops/shopService";
import { ShopDto } from "@/types/shop";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Clock3, PlusCircle, Store } from "lucide-react";
import toast from "react-hot-toast";
import JoinOrCreateShopModal from "@/components/shops/JoinOrCreateShopModal";
import RequireAuth from "@/components/common/RequireAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface ShopWithStatus extends ShopDto {
  userStatus: string;
}

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusMeta(shop: ShopWithStatus) {
  if (shop.status === "REMOVED") {
    return {
      label: "Removed",
      badgeClass:
        "border border-orange-300 bg-orange-500/80 text-white shadow-sm dark:border-orange-400/40 dark:bg-orange-500/70 dark:text-white",
      helperText: "Manage removed shop",
      isLocked: false,
      cardClass:
        "border-base-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
      actionClass: "text-primary transition group-hover:translate-x-0.5",
    };
  }

  if (shop.status === "DISABLED") {
    return {
      label: "Disabled",
      badgeClass:
        "border border-red-300 bg-red-500/80 text-white shadow-sm dark:border-red-400/40 dark:bg-red-500/70 dark:text-white",
      helperText: "Manage disabled shop",
      isLocked: false,
      cardClass:
        "border-base-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
      actionClass: "text-primary transition group-hover:translate-x-0.5",
    };
  }

  if (shop.userStatus === "PENDING") {
    return {
      label: "Pending",
      badgeClass:
        "border border-amber-300 bg-amber-500/80 text-white shadow-sm dark:border-amber-400/40 dark:bg-amber-500/70 dark:text-white",
      helperText: "Waiting for approval",
      isLocked: true,
      cardClass: "border-base-300/80 hover:border-base-300 hover:shadow-sm",
      actionClass: "text-muted-foreground",
    };
  }

  return {
    label: "Active",
    badgeClass:
      "border border-emerald-300 bg-emerald-500/80 text-white shadow-sm dark:border-emerald-400/40 dark:bg-emerald-500/70 dark:text-white",
    helperText: "Open manager workspace",
    isLocked: false,
    cardClass:
      "border-base-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
    actionClass: "text-primary transition group-hover:translate-x-0.5",
  };
}

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const router = useRouter();

  const sessionExpired = useSelector(
    (state: RootState) => state.session.expired,
  );

  const authInitialized = useSelector(
    (state: RootState) => state.auth.initialized,
  );

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);

      const shopStatuses = await ShopUserService.getShopsForCurrentUser();

      const shopDetails = await Promise.all(
        shopStatuses.map(async (membership) => {
          const shop = await ShopService.getById(membership.shopId);
          return { ...shop, userStatus: membership.status };
        }),
      );

      shopDetails.sort((a, b) => {
        const getPriority = (shop: ShopWithStatus) => {
          if (shop.status === "REMOVED") return 2;
          if (shop.userStatus === "ACTIVE") return 0;
          if (shop.userStatus === "PENDING") return 1;
          return 1;
        };

        return getPriority(a) - getPriority(b);
      });

      setShops(shopDetails);
    } catch (err) {
      console.error("Failed to load shops", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (sessionExpired) {
      setLoading(false);
      return;
    }

    fetchShops();
  }, [authInitialized, sessionExpired, fetchShops]);

  const handleActionComplete = async () => {
    setIsJoinModalOpen(false);
    await fetchShops();
  };

  const activeCount = shops.filter(
    (shop) => shop.userStatus === "ACTIVE" && shop.status !== "REMOVED",
  ).length;
  const pendingCount = shops.filter(
    (shop) => shop.userStatus === "PENDING" && shop.status !== "REMOVED",
  ).length;

  if (sessionExpired) {
    return (
      <RequireAuth requiredRole={["MANAGER"]}>
        <div />
      </RequireAuth>
    );
  }

  if (loading) {
    return (
      <RequireAuth requiredRole={["MANAGER"]}>
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-28 rounded-full bg-base-300" />
              <div className="h-10 w-64 rounded-2xl bg-base-300" />
              <div className="h-4 w-96 max-w-full rounded-full bg-base-300" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-28 rounded-2xl border border-base-300 bg-base-100"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-56 rounded-3xl border border-base-300 bg-base-100"
                />
              ))}
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth requiredRole={["MANAGER"]}>
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-base-200/70 p-6 shadow-sm sm:p-8">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_60%)] lg:block" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Building2 className="size-3.5" />
                Shop Workspace
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your shops
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Open an active shop to manage tours and sessions, or create a
                  new workspace when you are starting something fresh.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsJoinModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-content shadow-sm transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PlusCircle className="size-4.5" />
              Add shop
            </button>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Total shops
            </p>
            <p className="mt-2 text-2xl font-semibold">{shops.length}</p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Active
            </p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Pending
            </p>
            <p className="mt-2 text-2xl font-semibold">{pendingCount}</p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Shop list</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your active memberships are shown first.
              </p>
            </div>
          </div>

          {shops.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center shadow-sm">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-base-200 text-muted-foreground">
                <Store className="size-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">
                No shops connected yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Create your first shop or send a request to join an existing one
                to start managing tours.
              </p>
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-base-300 bg-base-100 px-4 py-2.5 text-sm font-medium transition hover:border-primary/30 hover:text-primary"
              >
                <PlusCircle className="size-4" />
                Add your first shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shops.map((shop) => {
                const statusMeta = getStatusMeta(shop);

                return (
                  <button
                    type="button"
                    key={shop.id}
                    className={`group rounded-[1.75rem] border p-5 text-left shadow-sm transition ${statusMeta.cardClass}`}
                    onClick={() => {
                      if (shop.userStatus === "PENDING") {
                        toast("Pending request to join this shop.");
                        return;
                      }

                      router.push(`/shops/manager?shopId=${shop.id}`);
                    }}
                    aria-label={
                      shop.status === "REMOVED"
                        ? `${shop.name} has been removed`
                        : shop.userStatus === "PENDING"
                          ? `${shop.name} is pending approval`
                          : `Open ${shop.name}`
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-base-200 text-muted-foreground">
                          <Store className="size-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold">
                            {shop.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Shop #{shop.id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    {shop.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {shop.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-base-300 pt-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock3 className="size-4" />
                        <span>Created {formatJoinedDate(shop.createdAt)}</span>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1 font-medium ${statusMeta.actionClass}`}
                      >
                        <span>{statusMeta.helperText}</span>
                        {!statusMeta.isLocked ? (
                          <ArrowRight className="size-4" />
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-base-300 bg-base-100 p-6 text-center text-muted-foreground transition hover:border-primary/35 hover:text-primary hover:shadow-sm"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-base-200">
                  <PlusCircle className="size-7" />
                </div>
                <p className="mt-4 text-base font-semibold">Add another shop</p>
                <p className="mt-2 max-w-xs text-sm leading-6">
                  Create a new workspace or request access to an existing one.
                </p>
              </button>
            </div>
          )}
        </section>

        <JoinOrCreateShopModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onActionComplete={handleActionComplete}
        />
      </div>
    </RequireAuth>
  );
}
