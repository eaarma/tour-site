"use client";

import toast from "react-hot-toast";
import { useState } from "react";
import { SessionCancellationService } from "@/lib/SessionCancellationService";
import Modal from "@/components/common/Modal";

interface Props {
  isOpen: boolean;
  sessionId: number;
  onClose: () => void;
  onCancelled: () => void;
}

export default function SessionCancellationModal({
  isOpen,
  sessionId,
  onClose,
  onCancelled,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleCancelSession = async () => {
    setLoading(true);

    try {
      await SessionCancellationService.cancelSession(sessionId);

      toast.success("Session cancelled successfully");

      onCancelled();
      onClose();
    } catch {
      toast.error("Failed to cancel session");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Cancel this session?</h2>

        <p className="text-sm text-muted-foreground">
          All booked customers will receive a full refund.
        </p>

        <p className="text-sm text-muted-foreground">
          Payment processing fees (~2%) will be deducted from the shop payout.
        </p>

        <p className="text-sm font-medium text-red-600">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <button className="btn" disabled={loading} onClick={onClose}>
            Back
          </button>

          <button
            className="btn btn-error"
            disabled={loading}
            onClick={handleCancelSession}
          >
            {loading ? "Cancelling..." : "Cancel Session"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
