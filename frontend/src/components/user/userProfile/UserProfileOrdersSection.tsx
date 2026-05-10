"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, UserRound, Users } from "lucide-react";
import toast from "react-hot-toast";

import CardFrame from "@/components/common/CardFrame";
import { OrderService } from "@/lib/orders/orderService";
import { OrderItemResponseDto, OrderStatus } from "@/types/order";
import { UserResponseDto } from "@/types/user";

import UserOrderDetailsModal from "./UserOrderDetailsModal";

interface UserProfileOrdersSectionProps {
  profile: UserResponseDto;
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const formatStatus = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getStatusClasses = (status: OrderStatus) => {
  if (status === "COMPLETED") {
    return "border-success/20 bg-success/10 text-success";
  }

  if (status === "CANCELLED" || status === "CANCELLED_CONFIRMED") {
    return "border-error/20 bg-error/10 text-error";
  }

  return "border-primary/15 bg-primary/5 text-primary";
};

export default function UserProfileOrdersSection({
  profile,
}: UserProfileOrdersSectionProps) {
  const [orderItems, setOrderItems] = useState<OrderItemResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OrderItemResponseDto | null>(
    null,
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getOrderItemsByUserId(profile.id);
        const sorted = data.sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime(),
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
    (item) =>
      new Date(item.scheduledAt) > now &&
      item.status !== "CANCELLED_CONFIRMED",
  );
  const past = orderItems.filter(
    (item) =>
      new Date(item.scheduledAt) <= now ||
      item.status === "CANCELLED_CONFIRMED",
  );

  const visibleItems = activeTab === "upcoming" ? upcoming : past;

  return (
    <CardFrame>
      <div className="px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              Tours
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-base-content">
              Your Bookings
            </h2>
            <p className="mt-2 text-sm leading-6 text-base-content/60">
              Track upcoming tours, review past bookings, and open each order
              for full details.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1">
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "upcoming"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/65 hover:text-primary"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "past"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/65 hover:text-primary"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past ({past.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-base-300 bg-base-100 p-8 text-center">
            <span className="loading loading-spinner loading-md text-primary" />
            <p className="mt-4 text-sm text-base-content/60">
              Loading your tours...
            </p>
          </div>
        ) : visibleItems.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-base-300 bg-base-100 p-5 transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-base-content">
                        {item.tourTitle}
                      </p>
                      <span
                        className={`badge border px-3 py-2 ${getStatusClasses(item.status)}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-base-content/70">
                      <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        <span>{formatDateTime(item.scheduledAt)}</span>
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>
                          {item.participants} participant
                          {item.participants === 1 ? "" : "s"}
                        </span>
                      </span>

                      {item.managerName && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                          <UserRound className="h-3.5 w-3.5 text-primary" />
                          <span>{item.managerName}</span>
                        </span>
                      )}

                      {item.tourMeetingPoint && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-base-200/65 px-3 py-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{item.tourMeetingPoint}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="rounded-2xl border border-base-300 bg-base-200/35 px-4 py-3 text-left lg:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50">
                        Paid
                      </p>
                      <p className="mt-1 text-lg font-semibold text-base-content">
                        {formatPrice(item.pricePaid)}
                      </p>
                    </div>

                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setSelectedItem(item)}
                    >
                      View Booking
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-base-300 bg-base-200/25 p-8 text-center">
            <p className="text-sm text-base-content/60">
              {activeTab === "upcoming"
                ? "No upcoming tours scheduled."
                : "No past tours found."}
            </p>
          </div>
        )}
      </div>

      {selectedItem && (
        <UserOrderDetailsModal
          orderItem={selectedItem}
          onClose={() => setSelectedItem(null)}
          onCancelled={(itemId, newStatus) => {
            setOrderItems((prev) =>
              prev.map((item) =>
                item.id === itemId
                  ? { ...item, status: newStatus as OrderStatus }
                  : item,
              ),
            );
          }}
        />
      )}
    </CardFrame>
  );
}

