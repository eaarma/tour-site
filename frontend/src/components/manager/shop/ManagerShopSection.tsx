"use client";

import { useEffect, useState } from "react";
import { ShopDto } from "@/types/shop";
import { ShopUserDto } from "@/types";
import { ShopService } from "@/lib/shops/shopService";
import { ShopUserService } from "@/lib/shops/shopUserService";
import ManagerShopUsersModal from "./ManagerShopUsersModal";
import ManagerShopSettingsModal from "./ManagerShopSettingsModal";
import { AlertTriangle, Settings } from "lucide-react";
import ManagerPendingRequestsModal from "./ManagerPendingRequestsModal";
import { useRouter } from "next/navigation";

const REVIEW_PENDING_ROLES = new Set(["MANAGER", "OWNER", "ADMIN"]);
const EDIT_SHOP_ROLES = new Set(["OWNER", "ADMIN"]);

interface Props {
  shopId: number;
  isRestricted?: boolean;
}

export default function ManagerShopSection({
  shopId,
  isRestricted = false,
}: Props) {
  const [shop, setShop] = useState<ShopDto | null>(null);
  const [members, setMembers] = useState<ShopUserDto[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isStatusInfoOpen, setIsStatusInfoOpen] = useState(false);
  const router = useRouter();

  const pendingRequests = members.filter((m) => m.status === "PENDING");
  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const canReviewPending =
    currentUserRole !== null && REVIEW_PENDING_ROLES.has(currentUserRole);
  const canEditShop =
    currentUserRole !== null && EDIT_SHOP_ROLES.has(currentUserRole);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, membership] = await Promise.all([
          ShopService.getById(shopId),
          ShopUserService.getMembership(shopId),
        ]);

        setShop(s);
        setCurrentUserRole(membership.role ?? null);

        const users =
          membership.role === "GUIDE"
            ? await ShopUserService.getActiveUsersForShop(shopId)
            : await ShopUserService.getUsersForShop(shopId);

        setMembers(users);
      } catch (err) {
        console.error("Failed to load shop data", err);
      }
    };
    fetchData();
  }, [shopId]);

  const handleUserUpdated = (updatedUser: ShopUserDto) => {
    setMembers((prev) =>
      prev.map((m) => (m.userId === updatedUser.userId ? updatedUser : m)),
    );
  };

  if (!shop) return null;

  const statusLabel = shop.status.toLowerCase();

  const statusMessage = `This shop has been ${statusLabel}${
    shop.statusReason ? ` because of ${shop.statusReason}` : ""
  }. Contact support for further questions.`;

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-base-300 bg-base-100 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight truncate">
              {shop.name}
            </h2>
            <span className="badge badge-outline border-base-300 bg-base-100/90 px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {currentUserRole ?? "Member"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {isRestricted && (
              <button
                type="button"
                className="badge badge-error badge-outline gap-1 text-xs uppercase tracking-[0.18em] hover:bg-error/10"
                onClick={() => setIsStatusInfoOpen(true)}
                title={statusMessage}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {shop.status}
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Shop ID: {shop.id}
          </p>
        </div>

        <div className="flex flex-wrap justify-end items-center gap-3">
          {canReviewPending && !isRestricted && (
            <button
              className={`btn btn-sm ${
                pendingRequests.length > 0
                  ? "btn-warning"
                  : "btn-outline btn-disabled"
              }`}
              onClick={() =>
                pendingRequests.length > 0 && setIsPendingModalOpen(true)
              }
            >
              {pendingRequests.length === 0
                ? "0 pending"
                : `${pendingRequests.length} pending`}
            </button>
          )}

          <button
            className="btn btn-sm btn-outline"
            onClick={() => setIsUsersModalOpen(true)}
          >
            {activeMembers.length} members
          </button>

          <div className="relative">
            <button
              className="btn btn-sm btn-ghost px-3 hover:bg-base-200"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-label="Shop actions"
            >
              <Settings className="w-5 h-5" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-40 bg-base-100 border border-gray-200 rounded-lg shadow-lg z-10"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {canEditShop && !isRestricted && (
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-base-200"
                    onClick={() => {
                      setIsSettingsModalOpen(true);
                      setDropdownOpen(false);
                    }}
                  >
                    Edit shop
                  </button>
                )}
                <button
                  className="w-full text-left px-4 py-2 hover:bg-base-200"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/shops"); // Navigate to the shops page.
                  }}
                >
                  Switch shop
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members modal */}
      <ManagerShopUsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        members={members.filter((m) => m.status === "ACTIVE")}
        shopId={shopId}
        currentUserRole={currentUserRole ?? undefined}
        isReadOnly={isRestricted}
        onUserUpdated={handleUserUpdated}
      />

      {/* Pending Requests modal */}
      {canReviewPending && !isRestricted && (
        <ManagerPendingRequestsModal
          isOpen={isPendingModalOpen}
          onClose={() => setIsPendingModalOpen(false)}
          pendingRequests={pendingRequests}
          shopId={shopId}
          onStatusChange={(updatedUserId, newStatus) => {
            setMembers((prev) =>
              prev.map((m) =>
                m.userId === updatedUserId ? { ...m, status: newStatus } : m,
              ),
            );
          }}
        />
      )}

      {/* Settings modal */}
      {canEditShop && !isRestricted && (
        <ManagerShopSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          shop={shop}
          onShopUpdated={(updated) => setShop(updated)}
        />
      )}

      {isStatusInfoOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-error/10 p-2 text-error">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-lg font-semibold">Shop {statusLabel}</h3>

                <p className="mt-2 text-sm text-base-content/75">
                  {statusMessage}
                </p>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsStatusInfoOpen(false)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push("/contact")}
              >
                Contact support
              </button>
            </div>
          </div>

          <button
            type="button"
            className="modal-backdrop"
            onClick={() => setIsStatusInfoOpen(false)}
            aria-label="Close shop status information"
          />
        </div>
      )}
    </div>
  );
}
