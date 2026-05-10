"use client";

import { Dispatch, SetStateAction } from "react";
import Modal from "@/components/common/Modal";
import { Tour } from "@/types";

const TOUR_STATUS_OPTIONS = ["ACTIVE", "ON_HOLD", "CANCELLED"] as const;
type TourStatus = (typeof TOUR_STATUS_OPTIONS)[number];

type Props = {
  tour: Tour | null;
  editedStatus: TourStatus;
  setEditedStatus: Dispatch<SetStateAction<TourStatus>>;
  saving: boolean;
  onClose: () => void;
  onSaveStatus: () => void;
};

export default function AdminTourModal({
  tour,
  editedStatus,
  setEditedStatus,
  saving,
  onClose,
  onSaveStatus,
}: Props) {
  if (!tour) return null;

  return (
    <Modal isOpen={!!tour} onClose={onClose}>
      <h3 className="text-lg font-bold mb-4">Tour Details</h3>

      <div className="space-y-2 text-sm mb-4">
        <p>
          <strong>ID:</strong> {tour.id}
        </p>
        <p>
          <strong>Name:</strong> {tour.title}
        </p>
        <p>
          <strong>Shop:</strong> {tour.shopName || `Shop #${tour.shopId}`}
        </p>
        <p>
          <strong>Type:</strong> {tour.type}
        </p>
        <p>
          <strong>Status:</strong> {tour.status}
        </p>
        <p>
          <strong>Location:</strong> {tour.location || "-"}
        </p>
        <p>
          <strong>Meeting Point:</strong> {tour.meetingPoint || "-"}
        </p>
        <p>
          <strong>Price:</strong> {tour.price} EUR
        </p>
        <p>
          <strong>Duration:</strong> {tour.timeRequired} min
        </p>
        <p>
          <strong>Participants:</strong> {tour.participants}
        </p>
        <p>
          <strong>Languages:</strong>{" "}
          {tour.language?.length ? tour.language.join(", ") : "-"}
        </p>
        <p>
          <strong>Categories:</strong>{" "}
          {tour.categories?.length
            ? tour.categories
                .map((category) => category.replace(/_/g, " "))
                .join(", ")
            : "-"}
        </p>
        <p className="whitespace-pre-line">
          <strong>Description:</strong> {tour.description || "-"}
        </p>
      </div>

      <div className="flex items-end gap-3 max-w-md">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Status</label>
          <select
            className="select select-bordered w-full"
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value as TourStatus)}
          >
            {TOUR_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          disabled={saving}
          onClick={onSaveStatus}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex justify-end pt-6">
        <button className="btn btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
