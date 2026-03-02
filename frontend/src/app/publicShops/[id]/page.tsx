"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShopDto } from "@/types/shop";
import { ShopUserDto } from "@/types";
import { ShopUserService } from "@/lib/shopUserService";
import { ShopService } from "@/lib/shopService";
import ShopHeaderSection from "@/components/publicShops/ShopHeaderSection";
import ShopGuidesSection from "@/components/publicShops/ShopGuidesSection";
import ShopToursSection from "@/components/publicShops/ShopToursSection";

export default function PublicShopPage() {
  const params = useParams();
  const shopId = Number(params.id);

  const [shop, setShop] = useState<ShopDto | null>(null);
  const [guides, setGuides] = useState<ShopUserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;

    const fetchData = async () => {
      try {
        const shopData = await ShopService.getById(shopId);
        setShop(shopData);

        const activeUsers = await ShopUserService.getActiveUsersForShop(shopId);

        setGuides(activeUsers);
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  if (loading) {
    return <div className="p-6">Loading shop...</div>;
  }

  if (!shop) {
    return <div className="p-6">Shop not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <ShopHeaderSection shop={shop} />

      <ShopGuidesSection guides={guides} />

      <ShopToursSection shopId={shop.id} />
    </div>
  );
}
