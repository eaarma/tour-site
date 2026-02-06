"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShopUserService } from "@/lib/shopUserService";
import { ShopService } from "@/lib/shopService";
import { TourSessionService } from "@/lib/tourSessionService";
import { TourService } from "@/lib/tourService";
import { ShopDto } from "@/types/shop";
import { UserResponseDto } from "@/types/user";
import ManagerProfileStatisticSection from "./ManagerProfileStatisticSection";
import ProfileSection from "./ProfileSection";
import ManagerProfileShopsSection from "./ManagerProfileShopsSections";
import ManagerProfileOrderSection from "./ManagerProfileOrderSection";
import { Tour } from "@/types";
import { TourSessionDto } from "@/types/tourSession";

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
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);

  const [managerSessions, setManagerSessions] = useState<TourSessionDto[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopStatuses = await ShopUserService.getShopsForCurrentUser();
        const activeShops = shopStatuses.filter((s) => s.status === "ACTIVE");

        const shopDetails = await Promise.all(
          activeShops.map(async (s) => await ShopService.getById(s.shopId)),
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

  // ✅ Fetch sessions assigned to current manager
  useEffect(() => {
    const fetchManagerSessions = async () => {
      if (!profile?.id) return;

      try {
        const sessions = await TourSessionService.getByManagerId(profile.id);
        setManagerSessions(sessions);

        // Stats
        const completed = sessions.filter((s) => s.status === "COMPLETED");
        setToursGiven(completed.length);

        const now = new Date();
        const upcoming = sessions.filter((s) => {
          if (s.status !== "CONFIRMED") return false;
          const dt = new Date(`${s.date}T${s.time}`);
          return dt > now;
        });
        setUpcomingTours(upcoming.length);

        // Total sessions
        setTotalSessions(sessions.length);

        // Total orders (order items count)
        const orders = sessions.reduce(
          (sum, s) => sum + (s.participants?.length ?? 0),
          0,
        );
        setTotalOrders(orders);

        // Total participants
        const participants = sessions.reduce(
          (sum, s) =>
            sum +
            (s.participants?.reduce((pSum, p) => pSum + p.participants, 0) ??
              0),
          0,
        );

        setTotalParticipants(participants);

        // Fetch tours needed for cards/modals
        const uniqueTourIds = Array.from(
          new Set(sessions.map((s) => s.tourId)),
        );
        const tourDetails = await Promise.all(
          uniqueTourIds.map((id) => TourService.getById(id)),
        );
        setTours(tourDetails);
      } catch (err) {
        console.error("Failed to fetch manager sessions", err);
      }
    };

    fetchManagerSessions();
  }, [profile?.id]);

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <ProfileSection user={profile} onProfileUpdated={setProfile} />

        <ManagerProfileStatisticSection
          shopsCount={shops.length}
          toursGiven={toursGiven}
          upcomingTours={upcomingTours}
          totalSessions={totalSessions}
          totalOrders={totalOrders}
          totalParticipants={totalParticipants}
        />

        {/* ✅ Sessions section (replaces orderitems section) */}
        <ManagerProfileOrderSection sessions={managerSessions} tours={tours} />

        <ManagerProfileShopsSection shops={shops} loading={loading} />

        <button
          className="btn btn-primary self-start"
          onClick={() => router.push("/shops")}
        >
          Go to Shops Page
        </button>
      </div>
    </div>
  );
}
