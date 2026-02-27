"use client";

import { TourScheduleResponseDto } from "@/types/tourSchedule";
import { Clock, CalendarDays, Users } from "lucide-react";

interface Props {
  schedule: TourScheduleResponseDto;
  showDate?: boolean;
  onEdit: (schedule: TourScheduleResponseDto) => void;
  onDelete: (id: number) => void;
  onViewSession?: (schedule: TourScheduleResponseDto) => void;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function ScheduleRow({
  schedule,
  showDate = false,
  onEdit,
  onDelete,
  onViewSession,
}: Props) {
  const isExpired = schedule.status === "EXPIRED";

  const booked =
    (schedule.bookedParticipants ?? 0) + (schedule.reservedParticipants ?? 0);

  const hasBookings = booked > 0;

  // Can modify only if active AND no bookings
  const canEdit = !isExpired && !hasBookings;

  const canDelete = !hasBookings;
  // Can view only if there are bookings
  const canViewSession = hasBookings;

  const statusColor =
    schedule.status === "ACTIVE"
      ? "text-green-600"
      : schedule.status === "BOOKED"
        ? "text-yellow-600"
        : "text-gray-500";

  return (
    <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-base-200/40 transition-colors">
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-1">
        {showDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            {formatDate(schedule.date)}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{schedule.time || "—"}</span>
        </div>

        {!showDate && (
          <div className="text-sm text-muted-foreground">
            {schedule.tourTitle}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Availability */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>
            {booked} / {schedule.maxParticipants} booked
          </span>
        </div>

        {/* Status */}
        <div className={`text-sm font-medium ${statusColor}`}>
          <span
            className={`badge badge-sm ${
              schedule.status === "ACTIVE"
                ? "badge-success"
                : schedule.status === "BOOKED"
                  ? "badge-warning"
                  : "badge-neutral"
            }`}
          >
            {schedule.status}
          </span>
        </div>

        {/* Lock Badge */}
        {hasBookings && (
          <span className="badge badge-warning badge-sm">Has bookings</span>
        )}

        {!hasBookings && !isExpired && (
          <span className="badge badge-success badge-sm">Editable</span>
        )}

        {isExpired && !hasBookings && (
          <span className="badge badge-neutral badge-sm">Expired</span>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          {canViewSession && onViewSession && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => onViewSession(schedule)}
            >
              View
            </button>
          )}

          {canEdit && (
            <button
              className="btn btn-sm btn-outline hover:border-primary hover:text-primary"
              onClick={() => onEdit(schedule)}
            >
              Edit
            </button>
          )}

          {canDelete && (
            <button
              className="btn btn-sm btn-outline hover:border-red-500 hover:text-red-500"
              onClick={() => onDelete(schedule.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
