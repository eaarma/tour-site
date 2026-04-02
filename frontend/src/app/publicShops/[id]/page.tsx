"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShopDto } from "@/types/shop";
import { PublicShopUserDto, Tour } from "@/types";
import { ShopUserService } from "@/lib/shopUserService";
import { ShopService } from "@/lib/shopService";
import ShopHeaderSection from "@/components/publicShops/ShopHeaderSection";
import ShopGuidesSection from "@/components/publicShops/ShopGuidesSection";
import ShopToursSection from "@/components/publicShops/ShopToursSection";
import { TourService } from "@/lib/tourService";
import { TourSessionService } from "@/lib/tourSessionService";

export default function PublicShopPage() {
  const params = useParams();
  const shopId = Number(params.id);

  const [shop, setShop] = useState<ShopDto | null>(null);
  const [guides, setGuides] = useState<PublicShopUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<Tour[]>([]);
  const [toursGiven, setToursGiven] = useState<number>(0);
  useEffect(() => {
    if (!shopId) return;

    const fetchData = async () => {
      try {
        const shopData = await ShopService.getById(shopId);
        setShop(shopData);

        const activeUsers =
          await ShopUserService.getPublicActiveUsersForShop(shopId);
        setGuides(activeUsers);

        const shopTours = await TourService.getByShopId(shopId);
        setTours(shopTours);
        const toursGiven = await TourSessionService.getCompletedCount(shopId);
        setToursGiven(toursGiven);
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
      <ShopHeaderSection
        shop={shop}
        toursGiven={toursGiven}
        guideCount={guides.length}
        tourCount={tours.length}
      />
      <ShopGuidesSection guides={guides} />
      <ShopToursSection shopId={shop.id} tours={tours} />
    </div>
  );
}
