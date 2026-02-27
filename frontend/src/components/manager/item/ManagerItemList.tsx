"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tour } from "@/types";
import ItemCard from "@/components/items/ItemCard";

interface ManagerItemListProps {
  items: Tour[];
  shopId: number;
}

export default function ManagerItemList({
  items,
  shopId,
}: ManagerItemListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "inactive" | "all">(
    "active",
  );

  // ✅ Filtering logic
  let filteredItems: Tour[] = [];
  if (activeTab === "active") {
    filteredItems = items.filter((i) => i.status === "ACTIVE");
  } else if (activeTab === "inactive") {
    filteredItems = items.filter(
      (i) => i.status === "ON_HOLD" || i.status === "CANCELLED",
    );
  } else {
    filteredItems = items;
  }

  return (
    <div className="sm:p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Tours</h2>

      {/* Tabs + Add Tour Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "active"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Active
            </button>

            <button
              onClick={() => setActiveTab("inactive")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "inactive"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Inactive
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              All
            </button>
          </div>
        </div>

        <button
          className="btn btn-outline btn-primary flex items-center gap-2"
          onClick={() => router.push(`/shops/manager/shop/${shopId}/items/new`)}
        >
          <span className="text-xl">+</span> Add a Tour
        </button>
      </div>

      {/* ✅ Scrollable grid container */}
      {filteredItems.length === 0 ? (
        <div className="text-center text-gray-500 m-14">
          No items found for this tab.
        </div>
      ) : (
        <div className="overflow-y-auto pr-2" style={{ maxHeight: "740px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                showStatus={true}
                onClick={() =>
                  router.push(`/shops/manager/shop/${shopId}/items/${item.id}`)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
