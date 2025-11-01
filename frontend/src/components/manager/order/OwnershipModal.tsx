"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import { ShopUserDto } from "@/types";
import { OrderService } from "@/lib/orderService";
import { ShopUserService } from "@/lib/shopUserService";
import toast from "react-hot-toast";

interface OwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: number;
  currentManagerName?: string;
  shopId: number;
  onReassigned: () => void;
}

export default function OwnershipModal({
  isOpen,
  onClose,
  orderItemId,
  currentManagerName,
  shopId,
  onReassigned,
}: OwnershipModalProps) {
  const [shopMembers, setShopMembers] = useState<ShopUserDto[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔹 Fetch members when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const members = await ShopUserService.getUsersForShop(shopId);
        setShopMembers(members);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load shop members");
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [isOpen, shopId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const managerIdToSend =
        selectedManagerId === "null" ? null : selectedManagerId;

      await OrderService.reassignManager(orderItemId, managerIdToSend);
      toast.success("Ownership updated successfully");
      onReassigned();
      onClose();
    } catch (err) {
      toast.error("Failed to update ownership");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Change Ownership</h3>

        <p className="mb-2 text-sm text-gray-700">
          Current manager:{" "}
          <span className="font-medium">
            <strong>{currentManagerName ?? "Unassigned"}</strong>
          </span>
        </p>

        {loadingMembers ? (
          <div className="flex items-center justify-center py-6">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <label className="form-control mb-4">
            <span className="label-text font-medium mr-2 mt-2">Assign to:</span>
            <select
              className="select select-bordered select-sm"
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value || "")}
            >
              <option value="">Select manager</option>
              <option value="null">Unassigned</option>
              {shopMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userName ?? m.userEmail}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex justify-end gap-2 mt-6">
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
            disabled={saving || loadingMembers}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
