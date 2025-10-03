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
    <div className="flex justify-between items-start mb-6 bg-base-100 p-4 rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-bold">{shop.name}</h2>
        <p className="text-sm text-gray-500">Shop ID: {shop.id}</p>
      </div>

      <div className="flex items-center gap-4">
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

        {/* Settings button */}
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setIsSettingsModalOpen(true)}
        >
          <Settings className="w-5 h-5" />
        </button>
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
