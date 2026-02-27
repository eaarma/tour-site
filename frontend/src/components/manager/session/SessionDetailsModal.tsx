"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/common/Modal";
import { TourSessionDto } from "@/types/tourSession";
import {
  Users,
  Calendar,
  Clock,
  CircleUserRound,
  BadgeCheck,
  Pin,
} from "lucide-react";

import OrderItemCard from "../order/OrderItemCard";
import OrderDetailsModal from "../order/OrderDetailsModal";
import SessionStatusModal from "./SessionStatusModal";
import SessionOwnershipModal from "./SessionOwnershipModal";
import { OrderItemResponseDto } from "@/types";
import { FaUser } from "react-icons/fa";

interface Props {
  session: TourSessionDto;
  onClose: () => void;
  onConfirmSession: (sessionId: number) => void;
  onCompleteSession: (sessionId: number) => void;
  onSessionUpdated: (updated: TourSessionDto) => void;
}

export default function SessionDetailsModal({
  session,
  onClose,
  onConfirmSession,
  onCompleteSession,
  onSessionUpdated,
}: Props) {
  const [selectedItem, setSelectedItem] = useState<OrderItemResponseDto | null>(
    null,
  );
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isOwnershipModalOpen, setIsOwnershipModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const paidParticipants = (session.participants ?? []).filter(
    (p) => p.status === "PAID",
  );

  const bookedCount = paidParticipants.reduce(
    (sum, p) => sum + p.participants,
    0,
  );

  const remaining = session.maxParticipants - bookedCount;

  const datetime = useMemo(
    () => new Date(`${session.date}T${session.time}`),
    [session.date, session.time],
  );
  const [sessionData, setSessionData] = useState(session);

  useEffect(() => {
    setSessionData(session);
  }, [session]);

  return (
    <>
      <Modal isOpen={true} onClose={onClose}>
        {/* ================= HEADER ================= */}
        <div className="mb-6 space-y-5">
          {/* Top Row: Title + Status */}
          <div className=" justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {session?.tourTitle}
              </h2>

              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" />
                  Session #{session.id}
                </span>

                {session?.tourLocation && (
                  <span className="truncate">{session.tourLocation}</span>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`badge badge-sm font-medium ${
                session.status === "PLANNED"
                  ? "badge-warning"
                  : session.status === "CONFIRMED"
                    ? "badge-info"
                    : session.status === "COMPLETED"
                      ? "badge-success"
                      : session.status === "CANCELLED"
                        ? "badge-error"
                        : "badge-neutral"
              }`}
            >
              {session.status}
            </span>
          </div>

          {/* Date & Time Block */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {datetime.toLocaleDateString()}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {datetime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-base-300" />

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Manager */}
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Assigned Manager
              </span>
              <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                <FaUser className="w-4 h-4 text-primary" />
                {sessionData.managerName ?? "Unassigned"}
              </div>
            </div>

            {/* Meeting Point */}
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Starting Point
              </span>
              <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Pin className="w-4 h-4 text-primary" />
                {sessionData.tourMeetingPoint ?? "Not specified"}
              </div>
            </div>
          </div>
        </div>

        {/* BOOKING SUMMARY */}
        <div className="bg-base-200 px-4 py-3 rounded-lg mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold text-lg">
            <Users className="w-5 h-5" />
            {bookedCount} / {session.maxParticipants} booked
          </div>

          <div className="text-gray-700 font-medium">
            {remaining} spaces available
          </div>
        </div>

        {/* PARTICIPANT LIST HEADER */}
        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <CircleUserRound className="w-5 h-5 text-gray-500" />
          Bookings
        </h3>

        {/* PARTICIPANT LIST */}
        <div className="space-y-3 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-2">
          {paidParticipants.map((item) => (
            <OrderItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="mt-6 flex justify-end gap-3 relative">
          {sessionData.status === "PLANNED" && (
            <button
              className="btn btn-primary"
              onClick={() => onConfirmSession(sessionData.id)}
            >
              Confirm Session
            </button>
          )}

          {session.status === "CONFIRMED" && (
            <button
              className="btn btn-success"
              onClick={() => onCompleteSession(session.id)}
            >
              Mark as Completed
            </button>
          )}

          {/* OPTIONS BUTTON WRAPPER (relative) */}
          <div className="relative">
            <button
              className="btn btn-outline"
              onClick={(e) => {
                e.stopPropagation();
                setOptionsOpen((x) => !x);
              }}
            >
              Options
            </button>

            {optionsOpen && (
              <div
                className="absolute right-0 bottom-full mb-2 w-48 bg-base-100 border border-base-300 shadow-lg rounded-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {/* VIEW TOUR */}
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-base-200"
                  onClick={() => {
                    setOptionsOpen(false);
                    window.open(`/items/${session?.tourId}`, "_blank");
                  }}
                >
                  View Tour
                </button>

                {/* ASSIGN MANAGER */}
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-base-200"
                  onClick={() => {
                    setOptionsOpen(false);
                    setIsOwnershipModalOpen(true);
                  }}
                >
                  Assign Manager
                </button>

                {/* UPDATE STATUS */}
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-base-200"
                  onClick={() => {
                    setOptionsOpen(false);
                    setIsStatusModalOpen(true);
                  }}
                >
                  Set Session Status
                </button>
              </div>
            )}
          </div>

          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>

      {/* MODALS */}
      {isOwnershipModalOpen && (
        <SessionOwnershipModal
          isOpen
          onClose={() => setIsOwnershipModalOpen(false)}
          sessionId={session.id}
          shopId={session?.shopId ?? 0}
          currentManagerId={session.managerId}
          currentManagerName={session.managerName}
          onUpdated={(updated) => {
            setSessionData(updated); // local update
            onSessionUpdated(updated); // global update
          }}
        />
      )}

      {isStatusModalOpen && (
        <SessionStatusModal
          isOpen
          onClose={() => setIsStatusModalOpen(false)}
          sessionId={session.id}
          currentStatus={session.status}
          onUpdated={(updated) => {
            setSessionData(updated); // local update
            onSessionUpdated(updated); // global update
          }}
        />
      )}

      {selectedItem && (
        <OrderDetailsModal
          isOpen
          orderItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
