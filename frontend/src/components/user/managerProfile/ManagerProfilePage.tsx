"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ShopService } from "@/lib/shops/shopService";
import { ShopUserService } from "@/lib/shops/shopUserService";
import { TourSessionService } from "@/lib/tours/tourSessionService";
import { TourService } from "@/lib/tours/tourService";
import { Tour } from "@/types";
import { ShopDto } from "@/types/shop";
import { TourSessionDto } from "@/types/tourSession";
import { UserResponseDto } from "@/types/user";

import ManagerProfileSessionSection from "./ManagerProfileOrderSection";
import ProfileSection from "./ProfileSection";
import ManagerProfileShopsSection from "./ManagerProfileShopsSections";
import ManagerProfileStatisticSection from "./ManagerProfileStatisticSection";

interface ManagerProfilePageProps {
  profile: UserResponseDto;
  setProfile: React.Dispatch<React.SetStateAction<UserResponseDto | null>>;
}

export default function ManagerProfilePage({
  profile,
  setProfile,
}: ManagerProfilePageProps) {
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [toursGiven, setToursGiven] = useState(0);
  const [upcomingTours, setUpcomingTours] = useState(0);
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
        const activeShops = shopStatuses.filter((shop) => shop.status === "ACTIVE");

        const shopDetails = await Promise.all(
          activeShops.map(async (shop) => ShopService.getById(shop.shopId)),
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

  useEffect(() => {
    const fetchManagerSessions = async () => {
      if (!profile?.id) return;

      try {
        const sessions = await TourSessionService.getByManagerId(profile.id);
        setManagerSessions(sessions);

        const completed = sessions.filter(
          (session) => session.status === "COMPLETED",
        );
        setToursGiven(completed.length);

        const now = new Date();
        const upcoming = sessions.filter((session) => {
          if (session.status !== "CONFIRMED") return false;
          const dateTime = new Date(`${session.date}T${session.time}`);
          return dateTime > now;
        });
        setUpcomingTours(upcoming.length);

        setTotalSessions(sessions.length);

        const orders = sessions.reduce(
          (sum, session) => sum + (session.participants?.length ?? 0),
          0,
        );
        setTotalOrders(orders);

        const participants = sessions.reduce(
          (sum, session) =>
            sum +
            (session.participants?.reduce(
              (participantSum, participant) =>
                participantSum + participant.participants,
              0,
            ) ?? 0),
          0,
        );
        setTotalParticipants(participants);

        const uniqueTourIds = Array.from(
          new Set(sessions.map((session) => session.tourId)),
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
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                Guide Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-bold text-base-content">
                Manager Profile
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/65">
                Review your guide profile, track assigned sessions, and jump
                into the shops you manage.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="badge badge-outline border-base-300 bg-base-100/80 px-4 py-3 capitalize text-base-content">
                {profile.role.toLowerCase()}
              </span>
              <span className="badge badge-outline border-base-300 bg-base-100/80 px-4 py-3 text-base-content">
                {shops.length} shop{shops.length === 1 ? "" : "s"}
              </span>
              <span className="badge badge-outline border-base-300 bg-base-100/80 px-4 py-3 text-base-content">
                {managerSessions.length} session
                {managerSessions.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </section>

        <ProfileSection user={profile} onProfileUpdated={setProfile} />

        <ManagerProfileStatisticSection
          shopsCount={shops.length}
          toursGiven={toursGiven}
          upcomingTours={upcomingTours}
          totalSessions={totalSessions}
          totalOrders={totalOrders}
          totalParticipants={totalParticipants}
        />

        <ManagerProfileSessionSection sessions={managerSessions} tours={tours} />

        <ManagerProfileShopsSection shops={shops} loading={loading} />

        <div>
          <button
            className="btn btn-primary h-12 px-6"
            onClick={() => router.push("/shops")}
          >
            Open Shops Workspace
          </button>
        </div>
      </div>
    </main>
  );
}

