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
    <section>
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat
          icon={<Briefcase className="w-5 h-5" />}
          title="Member of Shops"
          value={shopsCount}
        />

        <Stat
          icon={<CheckCircle className="w-5 h-5 text-success" />}
          title="Tours Given"
          value={toursGiven}
        />

        <Stat
          icon={<CalendarClock className="w-5 h-5 text-primary" />}
          title="Upcoming Tours"
          value={upcomingTours}
        />

        <Stat
          icon={<ClipboardList className="w-5 h-5" />}
          title="Total Sessions"
          value={totalSessions}
        />

        <Stat
          icon={<ClipboardList className="w-5 h-5" />}
          title="Total Orders"
          value={totalOrders}
        />

        <Stat
          icon={<Users className="w-5 h-5" />}
          title="Participants Guided"
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
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm p-2 space-y-8">
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
