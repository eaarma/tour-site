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

export default function ScheduleTourView({
  schedules,
  onEdit,
  onDelete,
  onViewSession,
}: Props) {
  // Group schedules by tour title
  const grouped = useMemo(() => {
    const map: Record<string, TourScheduleResponseDto[]> = {};

    schedules.forEach((s) => {
      const key = s.tourTitle || "Untitled Tour";
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(s);
    });

    // sort schedules inside each tour by date → time
    Object.values(map).forEach((list) =>
      list.sort((a, b) => {
        const dateCompare =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return (a.time || "").localeCompare(b.time || "");
      }),
    );

    return map;
  }, [schedules]);

  const sortedTours = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  if (!sortedTours.length) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
        <p className="text-muted-foreground">No schedules found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedTours.map((tour) => (
        <div
          key={tour}
          className="rounded-xl border border-base-300 bg-base-100 shadow-sm"
        >
          {/* Tour Header */}
          <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{tour}</h3>
            <span className="text-sm text-muted-foreground">
              {grouped[tour].length} schedule
              {grouped[tour].length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Schedule Rows */}
          <div className="divide-y divide-base-200">
            {grouped[tour].map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                schedule={schedule}
                showDate
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
