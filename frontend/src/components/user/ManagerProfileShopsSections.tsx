"use client";

import { ShopDto } from "@/types/shop";
import { useRouter } from "next/navigation";

interface Props {
  shops: ShopDto[];
  loading: boolean;
}

export default function ManagerProfileShopsSection({ shops, loading }: Props) {
  const router = useRouter();

  if (loading) return <div className="p-4">Loading shops...</div>;

  if (shops.length === 0)
    return (
      <div className="card bg-base-100 shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Your Shops</h3>
        <p className="text-gray-500">No shops associated with your account.</p>
      </div>
    );

  return (
    <div className="card bg-base-100 shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Your Shops</h3>

      {/* Horizontally scrollable cards */}
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="flex-none w-[280px] h-[180px] p-4 border rounded-lg shadow bg-base-100 transition cursor-pointer hover:shadow-lg snap-start"
            onClick={() => router.push(`/shops/manager?shopId=${shop.id}`)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold truncate">{shop.name}</h2>
            </div>

            <p className="text-sm text-gray-500 mt-1">Shop ID: {shop.id}</p>

            {shop.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                {shop.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
