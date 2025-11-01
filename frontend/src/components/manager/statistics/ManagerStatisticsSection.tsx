"use client";

import { Briefcase, CalendarCheck, MapPin } from "lucide-react";
import { Tour } from "@/types";
import { OrderItemResponseDto } from "@/types/order";

interface ManagerStatisticsSectionProps {
  tours: Tour[];
  orderItems: OrderItemResponseDto[];
}

export default function ManagerStatisticsSection({
  tours,
  orderItems,
}: ManagerStatisticsSectionProps) {
  // 1️⃣ Total active tours offered (for this shop)
  const totalTours = tours.filter((t) => t.status === "ACTIVE").length;

  // 2️⃣ Upcoming tours = confirmed order items in the future
  const upcomingTours = orderItems.filter(
    (item) =>
      item.status === "CONFIRMED" && new Date(item.scheduledAt) > new Date()
  ).length;

  // 3️⃣ Total orders = number of order items (bookings)
  const totalOrders = orderItems.length;

  const statistics = [
    {
      title: "Total Tours Offered",
      value: totalTours,
      icon: <Briefcase className="w-6 h-6 text-primary" />,
    },
    {
      title: "Upcoming Tours",
      value: upcomingTours,
      icon: <CalendarCheck className="w-6 h-6 text-success" />,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <MapPin className="w-6 h-6 text-accent" />,
    },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statistics.map((stat, idx) => (
          <div key={idx} className="card bg-base-100 shadow-md">
            <div className="card-body flex-row items-center justify-between p-4">
              <div>
                <h3 className="text-md font-medium text-base-content mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="text-right">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
