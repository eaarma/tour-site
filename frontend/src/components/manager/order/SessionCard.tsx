"use client";

import { Tour } from "@/types";
import { TourSessionDto } from "@/types/tourSession";
import { Users, Calendar, Clock, MapPin, Circle } from "lucide-react";

interface Props {
  session: TourSessionDto;
  tour?: Tour;
  onClick: () => void;
  onConfirmSession: (sessionId: number) => void;
  onCompleteSession: (sessionId: number) => void;
}

export default function SessionCard({
  session,
  tour,
  onClick,
  onConfirmSession,
  onCompleteSession,
}: Props) {
  const datetime = new Date(`${session.date}T${session.time}`);
  const totalParticipants =
    session.participants?.reduce((sum, p) => sum + p.participants, 0) ?? 0;

  const statusColor =
    session.status === "CONFIRMED"
      ? "text-green-600"
      : session.status === "PLANNED"
        ? "text-yellow-400"
        : session.status === "COMPLETED"
          ? "text-blue-600"
          : session.status === "CANCELLED"
            ? "text-red-600"
            : session.status === "CANCELLED_CONFIRMED"
              ? "text-gray-500"
              : "text-gray-400";

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-base-300 bg-base-100 
      hover:border-primary/60 hover:shadow-lg transition-all p-4 flex gap-3"
    >
      {/* Status indicator */}
      <div className="pt-1">
        <Circle className={`w-3 h-3 ${statusColor}`} fill="currentColor" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 flex-1">
        {/* === ROW 1: Title + Right column === */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div>
            <h3 className="text-lg font-semibold tracking-wide text-gray-800">
              {tour?.title ?? "Unknown Tour"}
            </h3>
            <div className="text-xs text-gray-500">Session #{session.id}</div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-1 sm:items-end">
            {/* Participants */}
            <div
              className="flex items-center gap-1 text-primary font-semibold
                  self-end sm:self-auto"
            >
              <Users className="w-4 h-4" />
              {totalParticipants}/{session.maxParticipants}
            </div>

            {/* Location / Date / Time */}
            <div
              className="flex items-center gap-3 text-sm text-gray-600
                  self-start sm:self-auto"
            >
              {tour?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tour.location}
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {datetime.toLocaleDateString()}
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {datetime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* === ROW 3: Assigned + Actions === */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Assigned to:{" "}
            <span className="font-medium">
              {session.managerName ?? "Unassigned"}
            </span>
          </span>

          <div className="flex gap-2">
            {session.status === "PLANNED" && (
              <button
                className="btn btn-sm btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirmSession(session.id);
                }}
              >
                Confirm
              </button>
            )}

            {session.status === "CONFIRMED" && (
              <button
                className="btn btn-sm btn-success"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompleteSession(session.id);
                }}
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
