"use client";

import { useEffect, useState } from "react";
import { OrderItemResponseDto } from "@/types/order";
import { UserResponseDto } from "@/types/user";
import { OrderService } from "@/lib/orderService";
import CardFrame from "@/components/common/CardFrame";
import toast from "react-hot-toast";
import UserOrderDetailsModal from "./UserOrderDetailsModal";

interface UserProfileOrdersSectionProps {
  profile: UserResponseDto;
}

export default function UserProfileOrdersSection({
  profile,
}: UserProfileOrdersSectionProps) {
  const [orderItems, setOrderItems] = useState<OrderItemResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OrderItemResponseDto | null>(
    null
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getOrderItemsByUserId(profile.id);
        const sorted = data.sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        );
        setOrderItems(sorted);
      } catch (err) {
        console.error("Failed to fetch user order items", err);
        toast.error("Failed to load your tours");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [profile.id]);

  const now = new Date();
  const upcoming = orderItems.filter(
    (i) => new Date(i.scheduledAt) > now && i.status !== "CANCELLED_CONFIRMED"
  );
  const past = orderItems.filter(
    (i) => new Date(i.scheduledAt) <= now || i.status === "CANCELLED_CONFIRMED"
  );

  const visibleItems = activeTab === "upcoming" ? upcoming : past;

  return (
    <CardFrame>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Tours</h2>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed mb-3">
          <button
            className={`tab ${activeTab === "upcoming" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`tab ${activeTab === "past" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <p>Loading your tours...</p>
        ) : visibleItems.length > 0 ? (
          <ul className="space-y-2 max-h-[500px] overflow-y-auto">
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className="border rounded-lg p-4 bg-base-100 hover:bg-base-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="font-semibold">{item.tourTitle}</p>
                    <p className="text-sm text-gray-500">
                      Scheduled for:{" "}
                      {new Date(item.scheduledAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Participants: {item.participants}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3 sm:mt-0">
                    <span
                      className={`badge ${
                        item.status === "COMPLETED"
                          ? "badge-success"
                          : item.status === "CANCELLED_CONFIRMED"
                          ? "badge-error"
                          : "badge-info"
                      }`}
                    >
                      {item.status}
                    </span>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setSelectedItem(item)}
                    >
                      View Order
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">
            {activeTab === "upcoming"
              ? "No upcoming tours scheduled."
              : "No past tours found."}
          </p>
        )}
      </div>

      {/* ✅ Order details modal */}
      {selectedItem && (
        <UserOrderDetailsModal
          orderItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </CardFrame>
  );
}
