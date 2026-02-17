"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import { Tour } from "@/types";
import { OrderItemParticipantDto, TourSessionDto } from "@/types/tourSession";
import { Users, Calendar, Clock, CircleUserRound } from "lucide-react";

import OrderItemCard from "./OrderItemCard";
import OrderDetailsModal from "./OrderDetailsModal";
import SessionStatusModal from "./SessionStatusModal";
import SessionOwnershipModal from "./SessionOwnershipModal";

interface Props {
  session: TourSessionDto;
  tour?: Tour;
  onClose: () => void;
  onConfirmSession: (sessionId: number) => void;
  onCompleteSession: (sessionId: number) => void;
  onSessionUpdated: (updated: TourSessionDto) => void;
}

export default function SessionDetailsModal({
  session,
  tour,
  onClose,
  onConfirmSession,
  onCompleteSession,
  onSessionUpdated,
}: Props) {
  const [selectedItem, setSelectedItem] =
    useState<OrderItemParticipantDto | null>(null);
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

  const datetime = new Date(`${session.date}T${session.time}`);
  const [sessionData, setSessionData] = useState(session);

  useEffect(() => {
    setSessionData(session);
  }, [session]);

  return (
    <>
      <Modal isOpen={true} onClose={onClose}>
        {/* HEADER */}
        <div className="mb-5">
          <div className="flex justify-between items-start">
            {/* LEFT SIDE TITLE */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-wide">
                {tour?.title}
              </h2>

              {/* LOCATION */}
              <p className="text-sm text-gray-500">{tour?.location}</p>

              {/* STATUS LINE */}
              <p className="text-sm text-gray-600 mt-1">
                Status:{" "}
                <span
                  className={
                    session.status === "PLANNED"
                      ? "text-yellow-600 font-semibold"
                      : session.status === "CONFIRMED"
                        ? "text-blue-600 font-semibold"
                        : session.status === "COMPLETED"
                          ? "text-green-600 font-semibold"
                          : session.status === "CANCELLED"
                            ? "text-red-600 font-semibold"
                            : "text-gray-600 font-semibold"
                  }
                >
                  {session.status}
                </span>
              </p>

              {/* DATE + TIME */}
              <div className="flex items-center gap-5 text-sm text-gray-600 mt-3">
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

          {/* MANAGER LINE */}
          <div className="mt-3">
            Assigned to:{" "}
            <span className="font-medium">
              <strong>{sessionData.managerName ?? "Unassigned"}</strong>
            </span>
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
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
          {paidParticipants.map((p) => (
            <OrderItemCard
              key={p.orderItemId}
              item={{
                id: p.orderItemId,
                name: p.name,
                participants: p.participants,
                status: p.status,
                tourTitle: tour?.title ?? "",
                scheduledAt: `${session.date}T${session.time}`,
                managerName: p.managerName,
                managerId: p.managerId,
                pricePaid: p.pricePaid ?? 0,
              }}
              onClick={() => setSelectedItem(p)}
              onConfirm={() => {}}
              onConfirmCancellation={() => {}}
              onComplete={() => {}}
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
                className="absolute right-0 mt-2 w-48 bg-base-100 border shadow-md rounded-lg z-30"
                onClick={(e) => e.stopPropagation()}
              >
                {/* VIEW TOUR */}
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-base-200"
                  onClick={() => {
                    setOptionsOpen(false);
                    window.open(`/items/${tour?.id}`, "_blank");
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
          shopId={tour?.shopId ?? 0}
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
          isOpen={true}
          orderItem={{
            ...selectedItem,
            id: selectedItem.orderItemId,
            scheduledAt: `${session.date}T${session.time}`,
          }}
          tour={tour}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
