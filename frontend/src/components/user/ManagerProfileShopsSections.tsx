"use client";

import { ShopDto } from "@/types/shop";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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

      <div className="flex gap-4 overflow-x-auto pb-2">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="min-w-[250px] border rounded-lg p-4 bg-base-100 shadow hover:shadow-lg cursor-pointer transition"
            onClick={() => router.push(`/shops/manager?shopId=${shop.id}`)}
          >
            <h4 className="font-semibold text-lg">{shop.name}</h4>
            <p className="text-sm text-gray-500 mt-1">{shop.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
