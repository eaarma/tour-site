"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShopUserService } from "@/lib/shopUserService";
import { ShopService } from "@/lib/shopService";
import { OrderService } from "@/lib/orderService";
import { ShopDto } from "@/types/shop";
import { UserResponseDto } from "@/types/user";
import ManagerProfileStatisticSection from "./ManagerProfileStatisticSection";
import ProfileSection from "./ProfileSection";
import ManagerProfileShopsSection from "./ManagerProfileShopsSections";
import ManagerProfileOrderSection from "./ManagerProfileOrderSection";
import { OrderItemResponseDto } from "@/types";

interface ManagerProfilePageProps {
  profile: UserResponseDto;
  setProfile: React.Dispatch<React.SetStateAction<UserResponseDto | null>>;
}

export default function ManagerProfilePage({
  profile,
  setProfile,
}: ManagerProfilePageProps) {
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [toursGiven, setToursGiven] = useState<number>(0);
  const [upcomingTours, setUpcomingTours] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [managerOrders, setManagerOrders] = useState<OrderItemResponseDto[]>(
    []
  );
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

  // 🔹 Fetch tours managed by the current user
  useEffect(() => {
    const fetchManagerTours = async () => {
      if (!profile?.id) return;
      try {
        const orderItems = await OrderService.getItemsByManagerId(profile.id);
        setManagerOrders(orderItems);
        const completedTours = orderItems.filter(
          (item) => item.status === "COMPLETED"
        );
        setToursGiven(completedTours.length);

        // Optional: count upcoming confirmed toursf
        const upcoming = orderItems.filter(
          (item) =>
            item.status === "CONFIRMED" &&
            new Date(item.scheduledAt) > new Date()
        );
        setUpcomingTours(upcoming.length);
      } catch (err) {
        console.error("Failed to fetch manager order items", err);
      }
    };

    fetchManagerTours();
  }, [profile?.id]);

  return (
    <main className="bg-base-200 min-h-screen p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Profile info */}
        <ProfileSection user={profile} onProfileUpdated={setProfile} />

        {/* Stats */}
        <ManagerProfileStatisticSection
          shopsCount={shops.length}
          toursGiven={toursGiven}
          upcomingTours={upcomingTours}
        />

        {/* Orders Section */}
        <ManagerProfileOrderSection orderItems={managerOrders} />

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
