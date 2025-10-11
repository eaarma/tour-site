"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ManagerShopSection from "@/components/manager/shop/ManagerShopSection";
import ManagerOrderSection from "@/components/manager/order/ManagerOrderSection";
import ManagerItemList from "@/components/manager/item/ManagerItemList";
import ManagerStatisticsSection from "@/components/manager/statistics/ManagerStatisticsSection";
import { Item } from "@/types";
import { OrderItemResponseDto } from "@/types/order";
import { TourService } from "@/lib/tourService";
import { OrderService } from "@/lib/orderService";
import RequireAuth from "@/components/common/RequireAuth";

export default function ShopManagerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopIdParam = searchParams.get("shopId");

  const [shopId, setShopId] = useState<number | null>(
    shopIdParam ? Number(shopIdParam) : null
  );
  const [tours, setTours] = useState<Item[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch shop-specific data
        const shopTours = await TourService.getByShopId(shopId);
        setTours(shopTours);

        const shopOrderItems = await OrderService.getItemsByShopId(shopId);
        setOrderItems(shopOrderItems);
      } catch (err) {
        console.error("Error loading manager page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  if (loading) {
    return <div className="p-6">Loading shop data...</div>;
  }

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

  return (
    <RequireAuth requiredRole="MANAGER">
      <div className="p-6 space-y-8">
        {/* 🏪 Shop Header */}
        <ManagerShopSection shopId={shopId} />

        {/* 📊 Shop Statistics */}
        <ManagerStatisticsSection tours={tours} orderItems={orderItems} />

        {/* 🧾 Orders */}
        <ManagerOrderSection orderItems={orderItems} tours={tours} />

        {/* 🧭 Items (Tours) */}
        <ManagerItemList items={tours} shopId={shopId} />
      </div>
    </RequireAuth>
  );
}
