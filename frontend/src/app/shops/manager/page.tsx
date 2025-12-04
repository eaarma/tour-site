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

export default function ShopManagerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shopIdParam = searchParams.get("shopId");
  const shopId = shopIdParam ? Number(shopIdParam) : null;

  const access = useShopAccess(shopId ?? 0); // null | true | false

  const [tours, setTours] = useState<Tour[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemResponseDto[]>([]);

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

      {/* 🧾 Orders */}
      <ManagerOrderSection orderItems={orderItems} tours={tours} />

      {/* 🧭 Items */}
      <ManagerItemList items={tours} shopId={shopId} />
    </div>
  );
}
