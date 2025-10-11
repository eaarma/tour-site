"use client";

import { useState } from "react";
import { ShopUserDto } from "@/types";
import { ShopUserService } from "@/lib/shopUserService";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: ShopUserDto;
}

export default function ManagerShopUserEditModal({
  isOpen,
  onClose,
  user,
}: Props) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);

  const handleSave = async () => {
    try {
      // Update status
      await ShopUserService.updateStatus(user.shopId, user.userId, status);
      // Optional: Implement updateRole endpoint similarly
      toast.success("User updated successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to update user", err);
      toast.error("Failed to update user");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-semibold mb-2">Edit User</h3>

        <div className="form-control">
          <label className="label">Role</label>
          <select
            className="select select-bordered w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>MANAGER</option>
            <option>STAFF</option>
            <option>VIEWER</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">Status</label>
          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>ACTIVE</option>
            <option>DISABLED</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
