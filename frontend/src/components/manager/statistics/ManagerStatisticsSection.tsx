"use client";

import {
  Briefcase,
  CalendarClock,
  CheckCircle,
  ClipboardList,
  Users,
} from "lucide-react";
interface ManagerStatisticsSectionProps {
  totalTours: number;
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  totalOrders: number;
  totalParticipants: number;
}

export default function ManagerStatisticsSection({
  totalTours,
  totalSessions,
  upcomingSessions,
  completedSessions,
  totalOrders,
  totalParticipants,
}: ManagerStatisticsSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat
          icon={<Briefcase className="w-5 h-5" />}
          title="Active Tours"
          value={totalTours}
        />

        <Stat
          icon={<ClipboardList className="w-5 h-5" />}
          title="Total Sessions"
          value={totalSessions}
        />

        <Stat
          icon={<CalendarClock className="w-5 h-5 text-primary" />}
          title="Upcoming Sessions"
          value={upcomingSessions}
        />

        <Stat
          icon={<CheckCircle className="w-5 h-5 text-success" />}
          title="Completed Sessions"
          value={completedSessions}
        />

        <Stat
          icon={<ClipboardList className="w-5 h-5" />}
          title="Total Orders"
          value={totalOrders}
        />

        <Stat
          icon={<Users className="w-5 h-5" />}
          title="Participants Served"
          value={totalParticipants}
        />
      </div>
    </section>
  );
}

function Stat({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-4 flex-row items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-gray-500">{icon}</div>
      </div>
    </div>
  );
}
