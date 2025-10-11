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
  onUserUpdated?: (updatedUser: ShopUserDto) => void;
  shopId: number;
}

export default function ManagerShopUserViewModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  shopId,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      // Update user status
      await ShopUserService.updateStatus(shopId, user.userId, status);

      // Optionally update role (if you add the backend endpoint)
      if (role !== user.role && ShopUserService.updateRole) {
        await ShopUserService.updateRole(shopId, user.userId, role);
      }

      const updatedUser = { ...user, role, status };
      onUserUpdated?.(updatedUser);
      toast.success("User updated successfully!");

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update user", err);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset edits
    setRole(user.role);
    setStatus(user.status);
    setIsEditing(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-semibold mb-3">User Details</h3>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Name:</strong> {user.userName ?? "-"}
          </p>
          <p>
            <strong>Email:</strong> {user.userEmail}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone ?? "-"}
          </p>

          {/* Role (editable) */}
          <div>
            <strong>Role:</strong>{" "}
            {isEditing ? (
              <select
                className="select select-bordered select-sm ml-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="MANAGER">MANAGER</option>
                <option value="GUIDE">GUIDE</option>
              </select>
            ) : (
              <span className="ml-2">{role}</span>
            )}
          </div>

          {/* Status (editable) */}
          <div>
            <strong>Status:</strong>{" "}
            {isEditing ? (
              <select
                className="select select-bordered select-sm ml-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            ) : (
              <span className="ml-2">{status}</span>
            )}
          </div>

          <p>
            <strong>Joined:</strong>{" "}
            {user.joinedAt
              ? new Date(user.joinedAt).toLocaleDateString("en-GB")
              : "-"}
          </p>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 pt-4">
          {isEditing ? (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={onClose}
                disabled={loading}
              >
                Close
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
