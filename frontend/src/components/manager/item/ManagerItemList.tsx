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
        <div role="tablist" className="tabs tabs-boxed">
          <button
            className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>
          <button
            className={`tab ${activeTab === "inactive" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("inactive")}
          >
            Inactive
          </button>
          <button
            className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
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
