"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import { ShopUserDto } from "@/types";
import { ShopUserService } from "@/lib/shopUserService";
import { TourSessionService } from "@/lib/tourSessionService";
import { TourSessionDto } from "@/types/tourSession";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;

  sessionId: number;
  shopId: number;

  currentManagerName?: string;
  currentManagerId?: string | null;

  onUpdated: (updated: TourSessionDto) => void;
}

export default function SessionOwnershipModal({
  isOpen,
  onClose,
  sessionId,
  shopId,
  currentManagerName,
  currentManagerId,
  onUpdated,
}: Props) {
  const [shopMembers, setShopMembers] = useState<ShopUserDto[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>(
    currentManagerId ?? ""
  );
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔹 Fetch shop members when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const members = await ShopUserService.getActiveUsersForShop(shopId);
        setShopMembers(members);
        setSelectedManagerId(currentManagerId ?? "");
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
        selectedManagerId.trim() === "" ? null : selectedManagerId;

      const updated = await TourSessionService.assignManager(
        sessionId,
        managerIdToSend
      );

      toast.success("Session ownership updated");
      onUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ownership");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Assign Session Manager</h3>

        <p className="mb-3 text-sm text-gray-700">
          Current manager: <strong>{currentManagerName ?? "Unassigned"}</strong>
        </p>

        {loadingMembers ? (
          <div className="flex justify-center py-6">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <label className="form-control mb-4">
            <span className="label-text font-medium mb-2">Assign to:</span>

            <select
              className="select select-bordered select-sm"
              value={selectedManagerId ?? ""}
              onChange={(e) => setSelectedManagerId(e.target.value)}
            >
              <option value="">Unassigned</option>

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
