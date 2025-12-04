"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import { OrderStatus } from "@/types";
import { OrderService } from "@/lib/orderService";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: number;
  currentStatus: OrderStatus;
  onUpdated: () => void; // reload parent data
}

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "CANCELLED_CONFIRMED",
];

export default function OrderStatusModal({
  isOpen,
  onClose,
  orderItemId,
  currentStatus,
  onUpdated,
}: Props) {
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
    }
  }, [isOpen, currentStatus]);

  const handleSave = async () => {
    try {
      setSaving(true);

      await OrderService.updateItemStatus(orderItemId, selectedStatus);

      toast.success("Order status updated");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Change Order Status</h3>

        <p className="mb-3 text-sm text-gray-700">
          Current status: <strong>{currentStatus}</strong>
        </p>

        <label className="form-control mb-4">
          <span className="label-text font-medium mr-2">New status:</span>
          <select
            className="select select-bordered select-sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
          >
            {ALL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end mt-6 gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={onClose}
            disabled={saving}
          >
            Close
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
