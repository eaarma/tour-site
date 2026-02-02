"use client";

import { useEffect, useState } from "react";
import { ShopDto } from "@/types/shop";
import { ShopUserDto } from "@/types";
import { ShopService } from "@/lib/shopService";
import { ShopUserService } from "@/lib/shopUserService";
import ManagerShopUsersModal from "./ManagerShopUsersModal";
import ManagerShopSettingsModal from "./ManagerShopSettingsModal";
import { Settings } from "lucide-react";
import ManagerPendingRequestsModal from "./ManagerPendingRequestsModal";
import { useRouter } from "next/navigation";
interface Props {
  shopId: number;
}

export default function ManagerShopSection({ shopId }: Props) {
  const [shop, setShop] = useState<ShopDto | null>(null);
  const [members, setMembers] = useState<ShopUserDto[]>([]);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const pendingRequests = members.filter((m) => m.status === "PENDING");
  const activeMembers = members.filter((m) => m.status === "ACTIVE");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const s = await ShopService.getById(shopId);
        setShop(s);

        const users = await ShopUserService.getUsersForShop(shopId);
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

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6 bg-base-100 p-4 rounded-lg shadow relative">
      {/* Left side: shop info */}
      <div>
        <h2 className="text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {shop.name}
        </h2>

        <p className="text-sm text-gray-500">Shop ID: {shop.id}</p>
      </div>

      {/* Right side: actions */}
      <div className="flex justify-end items-center gap-4">
        {/* Pending Requests button */}
        <button
          className={`btn btn-sm ${
            pendingRequests.length > 0
              ? "btn-outline btn-warning"
              : "btn-disabled"
          }`}
          onClick={() =>
            pendingRequests.length > 0 && setIsPendingModalOpen(true)
          }
        >
          {pendingRequests.length === 0
            ? "0 pending"
            : `${pendingRequests.length} pending `}
        </button>

        {/* Members button */}
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setIsUsersModalOpen(true)}
        >
          {activeMembers.length} members
        </button>

        {/* Settings dropdown */}
        <div className="relative">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <Settings className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-40 bg-base-100 border border-gray-200 rounded-lg shadow-lg z-10"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-base-200"
                onClick={() => {
                  setIsSettingsModalOpen(true);
                  setDropdownOpen(false);
                }}
              >
                Edit shop
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-base-200"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/shops"); // ✅ Navigate to shops page
                }}
              >
                Switch shop
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Members modal */}
      <ManagerShopUsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        members={members.filter((m) => m.status === "ACTIVE")}
        shopId={shopId}
        currentUserRole="MANAGER"
        onUserUpdated={handleUserUpdated}
      />

      {/* Pending Requests modal */}
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

      {/* Settings modal */}
      <ManagerShopSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        shop={shop}
        onShopUpdated={(updated) => setShop(updated)}
      />
    </div>
  );
}
