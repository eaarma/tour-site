"use client";

import Modal from "@/components/common/Modal";
import { Role, UserResponseDto } from "@/types/user";

type Props = {
  user: UserResponseDto | null;
  editedRole: Role;
  setEditedRole: (role: Role) => void;
  saving: boolean;
  onClose: () => void;
  onSaveRole: () => void;
  onRemove: () => void;
};

export default function AdminUserModal({
  user,
  editedRole,
  setEditedRole,
  saving,
  onClose,
  onSaveRole,
  onRemove,
}: Props) {
  if (!user) return null;

  return (
    <Modal isOpen={!!user} onClose={onClose}>
      <h3 className="text-lg font-bold mb-4">User Details</h3>

      {/* Info */}
      <div className="space-y-2 text-sm mb-4">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Name:</strong> {user.name || "-"}
        </p>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Status:</strong> {user.status}
        </p>
      </div>

      {/* Role edit */}
      <div className="flex items-end gap-3 max-w-md">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Role</label>
          <select
            className="select select-bordered w-full"
            value={editedRole}
            onChange={(e) => setEditedRole(e.target.value as Role)}
          >
            <option value="USER">USER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          disabled={saving}
          onClick={onSaveRole}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <button className="btn btn-error btn-sm" onClick={onRemove}>
          Remove User
        </button>

        <button className="btn btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
