"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import { SessionStatus, TourSessionDto } from "@/types/tourSession";
import toast from "react-hot-toast";
import { TourSessionService } from "@/lib/tourSessionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  currentStatus: SessionStatus;
  onUpdated?: (updated: TourSessionDto) => void;
}

const ALL_SESSION_STATUSES: SessionStatus[] = [
  "PLANNED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "CANCELLED_CONFIRMED",
];

export default function SessionStatusModal({
  isOpen,
  onClose,
  sessionId,
  currentStatus,
  onUpdated,
}: Props) {
  const [selected, setSelected] = useState<SessionStatus>(currentStatus);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setSelected(currentStatus);
  }, [isOpen, currentStatus]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const updated = await TourSessionService.updateStatus(
        sessionId,
        selected
      );

      toast.success("Session status updated");

      onUpdated?.(updated); // ⬅️ now correctly typed

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update session status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Change Session Status</h3>

        <p className="mb-3 text-sm text-gray-700">
          Current status: <strong>{currentStatus}</strong>
        </p>

        <label className="form-control mb-4">
          <span className="label-text font-medium mr-2">New status:</span>

          <select
            className="select select-bordered select-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value as SessionStatus)}
          >
            {ALL_SESSION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end mt-6 gap-2">
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
