"use client";

import { useEffect, useMemo, useState } from "react";
import { TourScheduleResponseDto } from "@/types/tourSchedule";

function formatDateDMY(iso: string) {
  // ISO "YYYY-MM-DD" -> "DD.MM.YYYY"
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

type Props = {
  schedules?: TourScheduleResponseDto[]; // make optional
  selectedScheduleId?: number;
  onSelect: (s: TourScheduleResponseDto | null) => void;
  className?: string;
};

export default function SchedulePicker({
  schedules = [], // ✅ fallback to empty array
  selectedScheduleId,
  onSelect,
  className = "",
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const schedulesByDate = useMemo(() => {
    return schedules.reduce<Record<string, TourScheduleResponseDto[]>>(
      (acc, s) => {
        (acc[s.date] ||= []).push(s);
        return acc;
      },
      {},
    );
  }, [schedules]);

  const dateKeys = useMemo(
    () => Object.keys(schedulesByDate).sort(),
    [schedulesByDate],
  );

  // keep selectedDate valid
  useEffect(() => {
    if (!dateKeys.length) {
      setSelectedDate(null);
      return;
    }
    if (
      !selectedScheduleId &&
      (!selectedDate || !dateKeys.includes(selectedDate))
    ) {
      setSelectedDate(dateKeys[0]);
    }
  }, [dateKeys, selectedDate]);

  useEffect(() => {
    if (!selectedScheduleId) return;

    const found = schedules.find((s) => s.id === selectedScheduleId);
    if (found) {
      setSelectedDate(found.date);
    }
  }, [selectedScheduleId, schedules]);

  const times = selectedDate ? (schedulesByDate[selectedDate] ?? []) : [];

  return (
    <div className={className}>
      <h3 className="font-semibold mb-2">Available dates</h3>
      <select
        className="select select-bordered w-full max-w-xs mb-4"
        value={selectedDate ?? ""}
        onChange={(e) => setSelectedDate(e.target.value || null)}
      >
        {!dateKeys.length && <option value="">No dates available</option>}
        {dateKeys.map((d) => (
          <option key={d} value={d}>
            {formatDateDMY(d)}
          </option>
        ))}
      </select>

      {selectedDate && (
        <>
          <h4 className="font-medium mb-2">Available times</h4>
          {times.length ? (
            <div className="flex flex-wrap gap-2">
              {times.map((t) => {
                const selected = t.id === selectedScheduleId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`badge p-3 transition cursor-pointer ${
                      selected ? "badge-primary text-white" : "badge-outline"
                    }`}
                    onClick={() => onSelect(t)}
                  >
                    {t.time}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No times for this date.</div>
          )}
        </>
      )}
    </div>
  );
}
