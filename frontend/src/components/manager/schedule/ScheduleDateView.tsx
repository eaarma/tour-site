"use client";

import { useMemo } from "react";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import ScheduleRow from "./ScheduleRow";

interface Props {
  schedules: TourScheduleResponseDto[];
  onEdit: (schedule: TourScheduleResponseDto) => void;
  onDelete: (id: number) => void;
  onViewSession?: (schedule: TourScheduleResponseDto) => void;
}
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function ScheduleDateView({
  schedules,
  onEdit,
  onDelete,
  onViewSession,
}: Props) {
  // Group schedules by date
  const grouped = useMemo(() => {
    const map: Record<string, TourScheduleResponseDto[]> = {};

    schedules.forEach((s) => {
      if (!map[s.date]) {
        map[s.date] = [];
      }
      map[s.date].push(s);
    });

    // sort times inside each date
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    );

    return map;
  }, [schedules]);

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  if (!sortedDates.length) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
        <p className="text-muted-foreground">No schedules found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div
          key={date}
          className="rounded-xl border border-base-300 bg-base-100 shadow-sm"
        >
          {/* Date Header */}
          <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
            <span className="text-sm text-muted-foreground">
              {grouped[date].length} schedule
              {grouped[date].length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Schedule Rows */}
          <div className="divide-y divide-base-200">
            {grouped[date].map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                schedule={schedule}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewSession={onViewSession}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
