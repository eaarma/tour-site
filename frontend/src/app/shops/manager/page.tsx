"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ManagerShopSection from "@/components/manager/shop/ManagerShopSection";
import ManagerItemList from "@/components/manager/item/ManagerItemList";
import ManagerStatisticsSection from "@/components/manager/statistics/ManagerStatisticsSection";
import { Tour } from "@/types";
import { TourService } from "@/lib/tourService";
import { useShopAccess } from "@/hooks/useShopAccess";
import Unauthorized from "@/components/common/Unauthorized";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  Navigation,
  Package,
  Users,
} from "lucide-react";

import { TourSessionDto } from "@/types/tourSession";
import { TourSessionService } from "@/lib/tourSessionService";
import ShopManagerPaymentSection from "@/components/manager/payment/ShopManagerPaymentSection";
import ManagerSessionSection from "@/components/manager/session/ManagerSessionSection";
import ManagerScheduleSection from "@/components/manager/schedule/ManagerScheduleSection";
import ManagerOrderSection from "@/components/manager/order/ManagerOrderSection";
import ManagerAssignmentSection from "@/components/manager/assignment/ManagerAssignmentSection";

export default function ShopManagerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shopIdParam = searchParams.get("shopId");
  const shopId = shopIdParam ? Number(shopIdParam) : null;

  const access = useShopAccess(shopId ?? 0); // null | true | false

  const [tours, setTours] = useState<Tour[]>([]);

  const [sessions, setSessions] = useState<TourSessionDto[]>([]);

  const [activeTab, setActiveTab] = useState<
    "sessions" | "tours" | "payments" | "orders" | "schedules" | "assignments"
  >("sessions");

  const [stats, setStats] = useState({
    totalTours: 0,
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalOrders: 0,
    totalParticipants: 0,
  });

  // ============================
  // 🔍 Fetch shop data only if allowed
  // ============================
  useEffect(() => {
    if (!shopId || access !== true) return;

    const load = async () => {
      try {
        const shopTours = await TourService.getByShopId(shopId);
        setTours(shopTours);

        // ⭐ NEW — fetch sessions for each tour
        const allSessions: TourSessionDto[] = [];
        for (const t of shopTours) {
          const tourSessions = await TourSessionService.getByTour(t.id);
          allSessions.push(...tourSessions);
        }

        // ⭐ Filter: only sessions with participants
        const bookedSessions = allSessions.filter(
          (s) => (s.participants?.length ?? 0) > 0,
        );

        setSessions(bookedSessions);
        const now = new Date();

        const totalTours = shopTours.filter(
          (t) => t.status === "ACTIVE",
        ).length;

        const totalSessions = bookedSessions.length;

        const upcomingSessions = bookedSessions.filter((s) => {
          if (s.status !== "CONFIRMED") return false;
          const dt = new Date(`${s.date}T${s.time}`);
          return dt > now;
        }).length;

        const completedSessions = bookedSessions.filter(
          (s) => s.status === "COMPLETED",
        ).length;

        const totalOrders = bookedSessions.reduce(
          (sum, s) => sum + (s.participants?.length ?? 0),
          0,
        );

        const totalParticipants = bookedSessions.reduce(
          (sum, s) =>
            sum +
            (s.participants?.reduce((pSum, p) => pSum + p.participants, 0) ??
              0),
          0,
        );

        setStats({
          totalTours,
          totalSessions,
          upcomingSessions,
          completedSessions,
          totalOrders,
          totalParticipants,
        });
      } catch (err) {
        console.error("Error loading manager page data", err);
      }
    };

    load();
  }, [shopId, access]);

  // ============================
  // 🌀 Loading state (auth + access)
  // ============================
  if (access === null) {
    return <div className="p-6">Loading shop access...</div>;
  }

  // ============================
  // ❌ No shopId provided
  // ============================
  if (!shopId) {
    return (
      <div className="p-6">
        <p className="text-gray-600 mb-4">No shop selected.</p>
        <button
          className="btn btn-outline"
          onClick={() => router.push("/shops")}
        >
          Back to My Shops
        </button>
      </div>
    );
  }

  // ============================
  // 🚫 User is not a member → show Unauthorized component
  // ============================
  if (access === false) {
    return <Unauthorized />;
  }

  // ============================
  // ✅ Authorized → show manager page
  // ============================
  return (
    <div className="p-6 space-y-8">
      {/* 🏪 Shop Section */}
      <ManagerShopSection shopId={shopId} />

      {/* 📊 Statistics */}
      <ManagerStatisticsSection
        totalTours={stats.totalTours}
        totalSessions={stats.totalSessions}
        upcomingSessions={stats.upcomingSessions}
        completedSessions={stats.completedSessions}
        totalOrders={stats.totalOrders}
        totalParticipants={stats.totalParticipants}
      />

      {/* ===== Tabs ===== */}
      <div className="mt-6">
        <div className="border-b border-base-300 mb-6">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex justify-between gap-2 sm:justify-start sm:gap-10">
              {/* Sessions */}
              <button
                onClick={() => setActiveTab("sessions")}
                className={`
        flex items-center justify-center sm:justify-start
        gap-2
        py-2 px-2 sm:px-3
        text-sm sm:text-[1.05rem]
        font-semibold tracking-wide
        transition-all
        ${
          activeTab === "sessions"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-primary/80"
        }
      `}
              >
                <Package className="w-5 h-5" strokeWidth={2.25} />
                <span
                  className={`${activeTab === "sessions" ? "inline" : "hidden"} sm:inline`}
                >
                  Sessions
                </span>
              </button>

              {/* Tours */}
              <button
                onClick={() => setActiveTab("tours")}
                className={`
        flex items-center justify-center sm:justify-start
        gap-2
        py-2 px-2 sm:px-3
        text-sm sm:text-[1.05rem]
        font-semibold tracking-wide
        transition-all
        ${
          activeTab === "tours"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-primary/80"
        }
      `}
              >
                <Navigation className="w-5 h-5" strokeWidth={2.25} />
                <span
                  className={`${activeTab === "tours" ? "inline" : "hidden"} sm:inline`}
                >
                  Tours
                </span>
              </button>

              {/* Schedules */}
              <button
                onClick={() => setActiveTab("schedules")}
                className={`
          flex items-center justify-center sm:justify-start
          gap-2
          py-2 px-2 sm:px-3
          text-sm sm:text-[1.05rem]
          font-semibold tracking-wide
          transition-all
          ${
            activeTab === "schedules"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-primary/80"
          }
        `}
              >
                <CalendarDays className="w-5 h-5" strokeWidth={2.25} />
                <span
                  className={`${activeTab === "schedules" ? "inline" : "hidden"} sm:inline`}
                >
                  Schedules
                </span>
              </button>

              {/* Orders */}
              <button
                onClick={() => setActiveTab("orders")}
                className={`
          flex items-center justify-center sm:justify-start
          gap-2
          py-2 px-2 sm:px-3
          text-sm sm:text-[1.05rem]
          font-semibold tracking-wide
          transition-all
          ${
            activeTab === "orders"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-primary/80"
          }
        `}
              >
                <ClipboardList className="w-5 h-5" strokeWidth={2.25} />
                <span
                  className={`${activeTab === "orders" ? "inline" : "hidden"} sm:inline`}
                >
                  Orders
                </span>
              </button>

              {/* Payments */}
              <button
                onClick={() => setActiveTab("payments")}
                className={`
        flex items-center justify-center sm:justify-start
        gap-2
        py-2 px-2 sm:px-3
        text-sm sm:text-[1.05rem]
        font-semibold tracking-wide
        transition-all
        ${
          activeTab === "payments"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-primary/80"
        }
      `}
              >
                <CreditCard className="w-5 h-5" strokeWidth={2.25} />
                <span
                  className={`${activeTab === "payments" ? "inline" : "hidden"} sm:inline`}
                >
                  Payments
                </span>
              </button>

              {/* Performance */}
              <button
                onClick={() => setActiveTab("assignments")}
                className={`
    flex items-center justify-center sm:justify-start
    gap-2
    py-2 px-2 sm:px-3
    text-sm sm:text-[1.05rem]
    font-semibold tracking-wide
    transition-all
    ${
      activeTab === "assignments"
        ? "text-primary border-b-2 border-primary"
        : "text-gray-600 hover:text-primary/80"
    }
  `}
              >
                <Users className="w-5 h-5" strokeWidth={2.25} />
                <span
                  className={`${activeTab === "assignments" ? "inline" : "hidden"} sm:inline`}
                >
                  Assignments
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab panels */}
        {activeTab === "sessions" && (
          <ManagerSessionSection
            sessions={sessions}
            tours={tours}
            shopId={shopId}
          />
        )}

        {activeTab === "tours" && (
          <ManagerItemList items={tours} shopId={shopId} />
        )}

        {activeTab === "schedules" && (
          <ManagerScheduleSection shopId={shopId} />
        )}

        {activeTab === "orders" && <ManagerOrderSection shopId={shopId} />}

        {activeTab === "payments" && (
          <ShopManagerPaymentSection shopId={shopId} />
        )}

        {activeTab === "assignments" && (
          <ManagerAssignmentSection shopId={shopId} />
        )}
      </div>
    </div>
  );
}
