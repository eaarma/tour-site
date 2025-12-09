"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ManagerShopSection from "@/components/manager/shop/ManagerShopSection";
import ManagerOrderSection from "@/components/manager/order/ManagerOrderSection";
import ManagerItemList from "@/components/manager/item/ManagerItemList";
import ManagerStatisticsSection from "@/components/manager/statistics/ManagerStatisticsSection";
import { Tour } from "@/types";
import { OrderItemResponseDto } from "@/types/order";
import { TourService } from "@/lib/tourService";
import { OrderService } from "@/lib/orderService";
import RequireAuth from "@/components/common/RequireAuth";
import { useShopAccess } from "@/hooks/useShopAccess";
import Unauthorized from "@/components/common/Unauthorized";
import { Navigation, Package } from "lucide-react";

export default function ShopManagerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shopIdParam = searchParams.get("shopId");
  const shopId = shopIdParam ? Number(shopIdParam) : null;

  const access = useShopAccess(shopId ?? 0); // null | true | false

  const [tours, setTours] = useState<Tour[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemResponseDto[]>([]);

  const [activeTab, setActiveTab] = useState<"orders" | "tours">("orders");

  // ============================
  // 🔍 Fetch shop data only if allowed
  // ============================
  useEffect(() => {
    if (!shopId || access !== true) return;

    const load = async () => {
      try {
        const shopTours = await TourService.getByShopId(shopId);
        setTours(shopTours);
        const shopOrderItems = await OrderService.getItemsByShopId(shopId);
        setOrderItems(shopOrderItems);
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
      <ManagerStatisticsSection tours={tours} orderItems={orderItems} />

      {/* ===== Tabs ===== */}
      <div className="mt-6">
        <div className="border-b border-base-300 mb-10">
          <div className="flex gap-10">
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-3 px-1 text-[1.05rem] font-semibold tracking-wide 
        flex items-center gap-2 transition-all 
        ${
          activeTab === "orders"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-700 hover:text-gray-900"
        }`}
            >
              <Package className="w-5 h-5" strokeWidth={2.25} />
              Orders
            </button>

            <button
              onClick={() => setActiveTab("tours")}
              className={`py-3 px-1 text-[1.05rem] font-semibold tracking-wide 
        flex items-center gap-2 transition-all 
        ${
          activeTab === "tours"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-700 hover:text-gray-900"
        }`}
            >
              <Navigation className="w-5 h-5" strokeWidth={2.25} />
              Tours
            </button>
          </div>
        </div>

        {/* Tab panels */}
        {activeTab === "orders" && (
          <ManagerOrderSection orderItems={orderItems} tours={tours} />
        )}

        {activeTab === "tours" && (
          <ManagerItemList items={tours} shopId={shopId} />
        )}
      </div>
    </div>
  );
}
