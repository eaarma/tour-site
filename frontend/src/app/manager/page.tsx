"use client";

import { useEffect, useState } from "react";
import ManagerItemList from "@/components/manager/ManagerItemList";
import ManagerOrderSection from "@/components/manager/ManagerOrderSection";
import ManagerStatisticsSection from "@/components/manager/ManagerStatisticsSection";
import { Item } from "@/types";
import { OrderResponseDto } from "@/types/order";
import { AuthService } from "@/lib/AuthService";
import { ShopUserService } from "@/lib/shopUserService";
import { TourService } from "@/lib/tourService";
import { OrderService } from "@/lib/orderService";
import RequireAuth from "@/components/common/RequireAuth";

export default function ManagerPage() {
  const [tours, setTours] = useState<Item[]>([]);
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [shopId, setShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        const shops = await ShopUserService.getShopsForCurrentUser();
        if (!shops || shops.length === 0) return;

        // Pick first shop (later allow selection)
        const id = shops[0].shopId;
        setShopId(id);

        const shopTours = await TourService.getByShopId(id);
        setTours(shopTours);

        const shopOrders = await OrderService.getByShopId(id);
        setOrders(shopOrders);
      } catch (err) {
        console.error("Error loading manager page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!shopId) {
    return <div className="p-6">No shop assigned to this account.</div>;
  }

  return (
    <RequireAuth requiredRole="MANAGER">
      <div className="p-6">
        <ManagerStatisticsSection tours={tours} orders={orders} />
        <ManagerOrderSection orders={orders} tours={tours} />
        <ManagerItemList items={tours} shopId={shopId} />
      </div>
    </RequireAuth>
  );
}
