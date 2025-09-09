"use client";

import { Briefcase, CalendarCheck, MapPin } from "lucide-react";
import { Item } from "@/types";
import { OrderResponseDto } from "@/types/order";

interface ManagerStatisticsSectionProps {
  tours: Item[];
  orders: OrderResponseDto[];
}

export default function ManagerStatisticsSection({
  tours,
  orders,
}: ManagerStatisticsSectionProps) {
  const totalTours = tours.length;
  const upcomingTours = tours.filter(
    (t) => new Date(t.scheduledAt) > new Date()
  ).length;
  const availableTours = tours.filter((t) => t.availableSeats > 0).length; // if you have availableSeats

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
      title: "Available Tours",
      value: availableTours,
      icon: <MapPin className="w-6 h-6 text-accent" />,
    },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Statistics Overview</h2>
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
