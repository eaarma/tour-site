"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShopUserService } from "@/lib/shopUserService";
import { ShopService } from "@/lib/shopService";
import { ShopDto } from "@/types/shop";
import { UserResponseDto } from "@/types/user";
import ManagerProfileStatisticSection from "./ManagerProfileStatisticSection";
import ProfileSection from "./ProfileSection";
import ManagerProfileShopsSection from "./ManagerProfileShopsSections";

interface ManagerProfilePageProps {
  profile: UserResponseDto;
  setProfile: React.Dispatch<React.SetStateAction<UserResponseDto | null>>;
}

export default function ManagerProfilePage({
  profile,
  setProfile,
}: ManagerProfilePageProps) {
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopStatuses = await ShopUserService.getShopsForCurrentUser();
        const activeShops = shopStatuses.filter((s) => s.status === "ACTIVE");

        const shopDetails = await Promise.all(
          activeShops.map(async (s) => await ShopService.getById(s.shopId))
        );

        setShops(shopDetails);
      } catch (err) {
        console.error("Failed to load manager shops", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <main className="bg-base-200 min-h-screen p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Profile info */}
        <ProfileSection user={profile} onProfileUpdated={setProfile} />

        {/* Stats */}
        <ManagerProfileStatisticSection
          shopsCount={shops.length}
          toursGiven={12} // dummy for now
          upcomingTours={3} // dummy for now
        />

        {/* Shops */}
        <ManagerProfileShopsSection shops={shops} loading={loading} />

        {/* Go to Shops Page */}
        <button
          className="btn btn-primary self-start"
          onClick={() => router.push("/shops")}
        >
          Go to Shops Page
        </button>
      </div>
    </main>
  );
}
