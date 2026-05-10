"use client";

import { useState } from "react";
import { ShopUserDto } from "@/types";
import { ShopUserService } from "@/lib/shops/shopUserService";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: ShopUserDto;
  shopId: number;
  onUserUpdated: (updated: ShopUserDto) => void;
}

export default function ManagerShopUserEditModal({
  isOpen,
  onClose,
  user,
  shopId,
  onUserUpdated,
}: Props) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [loading, setLoading] = useState(false);

  const canEditUser = user.role !== "OWNER" && user.role !== "ADMIN";

  const handleSave = async () => {
    try {
      setLoading(true);

      if (status !== user.status) {
        await ShopUserService.updateStatus(shopId, user.userId, status);
      }

      if (role !== user.role) {
        await ShopUserService.updateRole(shopId, user.userId, role);
      }

      toast.success("User updated successfully");

      onUserUpdated({
        ...user,
        status,
        role,
      });

      onClose();
    } catch (err) {
      console.error("Failed to update user", err);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-semibold mb-2">Edit User</h3>

        {!canEditUser ? (
          <p className="text-sm text-gray-500">
            Owner and admin memberships cannot be changed here.
          </p>
        ) : (
          <>
            <div className="form-control">
              <label className="label">Role</label>
              <select
                className="select select-bordered w-full"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="MANAGER">MANAGER</option>
                <option value="GUIDE">GUIDE</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">Status</label>
              <select
                className="select select-bordered w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-3">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          {canEditUser && (
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

