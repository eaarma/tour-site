"use client";

import { useEffect, useState } from "react";
import { ShopUserService } from "@/lib/shopUserService";
import { ShopService } from "@/lib/shopService";
import { ShopDto } from "@/types/shop";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import JoinOrCreateShopModal from "@/components/shops/JoinOrCreateShopModal";
import RequireAuth from "@/components/common/RequireAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface ShopWithStatus extends ShopDto {
  userStatus: string;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const router = useRouter();

  const authInitialized = useSelector(
    (state: RootState) => state.auth.initialized,
  );

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopStatuses = await ShopUserService.getShopsForCurrentUser();

        const shopDetails = await Promise.all(
          shopStatuses.map(async (s) => {
            const shop = await ShopService.getById(s.shopId);
            return { ...shop, userStatus: s.status };
          }),
        );

        // ✅ Sort: Active first, Pending after
        shopDetails.sort((a, b) => {
          if (a.userStatus === "ACTIVE" && b.userStatus !== "ACTIVE") return -1;
          if (a.userStatus !== "ACTIVE" && b.userStatus === "ACTIVE") return 1;
          return 0;
        });

        setShops(shopDetails);
      } catch (err) {
        console.error("Failed to load shops", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authInitialized) return;
    fetchShops();
  }, [authInitialized]);

  const handleRequestSent = () => {
    toast.success("Request sent ✅");
    setIsJoinModalOpen(false);
    // Give user a moment to see toast before refreshing
    setTimeout(() => window.location.reload(), 1000);
  };

  if (loading) return <div className="p-6">Loading shops...</div>;

  return (
    <RequireAuth requiredRole={["MANAGER"]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Your Shops</h1>

        {shops.length === 0 ? (
          <p className="text-gray-500 mb-6">
            No shops associated with your account.
          </p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => {
            const isPending = shop.userStatus === "PENDING";

            return (
              <div
                key={shop.id}
                className={`p-4 border rounded-lg shadow bg-base-100 transition ${
                  isPending
                    ? "opacity-60 cursor-not-allowed hover:shadow"
                    : "cursor-pointer hover:shadow-lg"
                }`}
                onClick={() => {
                  if (isPending) {
                    toast("Pending request to join this shop ⏳", {
                      icon: "⏳",
                    });
                    return;
                  }
                  router.push(`/shops/manager?shopId=${shop.id}`);
                }}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{shop.name}</h2>
                  {isPending && (
                    <span className="badge badge-warning text-xs">Pending</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Shop ID: {shop.id}</p>
                {shop.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {shop.description}
                  </p>
                )}
              </div>
            );
          })}

          {/* "Join another shop" card */}
          <div
            onClick={() => setIsJoinModalOpen(true)}
            className="p-4 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center text-gray-500 hover:text-primary hover:border-primary transition cursor-pointer bg-base-100"
          >
            <PlusCircle className="w-10 h-10 mb-2" />
            <p className="font-medium">Add shop</p>
          </div>
        </div>

        {/* Join/Create Modal */}
        <JoinOrCreateShopModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onActionComplete={handleRequestSent}
        />
      </div>
    </RequireAuth>
  );
}
