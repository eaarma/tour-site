"use client";

import {
  Briefcase,
  CheckCircle,
  CalendarClock,
  Users,
  ClipboardList,
} from "lucide-react";

interface Props {
  shopsCount: number;
  toursGiven: number;
  upcomingTours: number;
  totalSessions: number;
  totalOrders: number;
  totalParticipants: number;
}

export default function ManagerProfileStatisticSection({
  shopsCount,
  toursGiven,
  upcomingTours,
  totalSessions,
  totalOrders,
  totalParticipants,
}: Props) {
  return (
    <div className="card bg-base-100 shadow-lg p-5">
      <h2 className="text-2xl font-bold mb-5">Statistics</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Shops */}
        <Stat
          icon={<Briefcase className="w-5 h-5" />}
          title="Member of"
          value={shopsCount}
          subtitle="Shops"
        />

        {/* Tours Given */}
        <Stat
          icon={<CheckCircle className="w-5 h-5 text-success" />}
          title="Tours Given"
          value={toursGiven}
        />

        {/* Upcoming */}
        <Stat
          icon={<CalendarClock className="w-5 h-5 text-primary" />}
          title="Upcoming Tours"
          value={upcomingTours}
        />

        {/* Total Sessions */}
        <Stat
          icon={<ClipboardList className="w-5 h-5" />}
          title="Total Sessions"
          value={totalSessions}
        />

        {/* Orders */}
        <Stat
          icon={<ClipboardList className="w-5 h-5" />}
          title="Total Orders"
          value={totalOrders}
        />

        {/* Participants */}
        <Stat
          icon={<Users className="w-5 h-5" />}
          title="Participants Guided"
          value={totalParticipants}
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-base-200 rounded-lg p-4 text-center flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
}
