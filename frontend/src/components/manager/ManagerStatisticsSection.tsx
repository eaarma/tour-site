"use client";

import { Briefcase, CalendarCheck, MapPin } from "lucide-react";

interface Statistic {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const statistics: Statistic[] = [
  {
    title: "Total Tours Offered",
    value: 42,
    icon: <Briefcase className="w-6 h-6 text-primary" />,
  },
  {
    title: "Upcoming Tours",
    value: 12,
    icon: <CalendarCheck className="w-6 h-6 text-success" />,
  },
  {
    title: "Available Tours",
    value: 5,
    icon: <MapPin className="w-6 h-6 text-accent" />,
  },
];

export default function ManagerStatisticsSection() {
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
