"use client";

import {
  Briefcase,
  CalendarClock,
  CheckCircle,
  ClipboardList,
  Users,
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
    <section className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
        Snapshot
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-base-content">
        Guide Statistics
      </h2>
      <p className="mt-2 text-sm leading-6 text-base-content/60">
        A quick overview of your activity across tours, shops, and assigned
        participants.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Stat
          icon={<Briefcase className="h-5 w-5" />}
          title="Member of Shops"
          value={shopsCount}
        />
        <Stat
          icon={<CheckCircle className="h-5 w-5 text-success" />}
          title="Tours Given"
          value={toursGiven}
        />
        <Stat
          icon={<CalendarClock className="h-5 w-5 text-primary" />}
          title="Upcoming Tours"
          value={upcomingTours}
        />
        <Stat
          icon={<ClipboardList className="h-5 w-5" />}
          title="Total Sessions"
          value={totalSessions}
        />
        <Stat
          icon={<ClipboardList className="h-5 w-5" />}
          title="Total Orders"
          value={totalOrders}
        />
        <Stat
          icon={<Users className="h-5 w-5" />}
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
    <div className="rounded-2xl border border-base-300 bg-base-200/35 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm text-base-content/60">{title}</h3>
          <p className="mt-2 text-3xl font-bold text-base-content">{value}</p>
        </div>
        <div className="rounded-xl bg-base-100 p-3 text-primary shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}
