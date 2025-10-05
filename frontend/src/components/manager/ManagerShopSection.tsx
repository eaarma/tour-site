"use client";

import { useEffect, useState } from "react";
import { ShopDto } from "@/types/shop";
import { ShopUserDto } from "@/types";
import { ShopService } from "@/lib/shopService";
import { ShopUserService } from "@/lib/shopUserService";
import ManagerShopUsersModal from "./ManagerShopUsersModal";
import ManagerShopSettingsModal from "./ManagerShopSettingsModal";
import { Settings } from "lucide-react";

interface Props {
  shopId: number;
}

export default function ManagerShopSection({ shopId }: Props) {
  const [shop, setShop] = useState<ShopDto | null>(null);
  const [members, setMembers] = useState<ShopUserDto[]>([]);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  if (!shop) return null;

  return (
    <div className="flex justify-between items-start mb-6 bg-base-100 p-4 rounded-lg shadow relative">
      {/* Left side: shop info */}
      <div>
        <h2 className="text-2xl font-bold">{shop.name}</h2>
        <p className="text-sm text-gray-500">Shop ID: {shop.id}</p>
      </div>

      {/* Right side: actions */}
      <div className="flex items-center gap-4 relative">
        {/* Pending Requests button */}
        <button className="btn btn-sm btn-outline btn-warning">
          Pending requests
        </button>

        {/* Members button */}
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setIsUsersModalOpen(true)}
        >
          {members.length} members
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
                  console.log("Switch shop clicked");
                  setDropdownOpen(false);
                  // We'll handle actual switching next
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
        members={members}
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
