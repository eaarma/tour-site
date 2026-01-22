"use client";

import { useState } from "react";
import { ShopUserDto } from "@/types";
import Modal from "../../common/Modal";
import ManagerShopUserViewModal from "./ManagerShopUserViewModal";
import ManagerShopUserEditModal from "./ManagerShopUserEditModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  members: ShopUserDto[];
  currentUserRole?: string;
  shopId: number;
  onUserUpdated: (user: ShopUserDto) => void;
}

export default function ManagerShopUsersModal({
  isOpen,
  onClose,
  members,
  currentUserRole,
  shopId,
  onUserUpdated,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<ShopUserDto | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const canEdit = currentUserRole === "MANAGER";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="m-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Shop Members</h3>
        </div>

        {members.length === 0 ? (
          <p className="text-gray-500">No members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.userId}>
                    <td>{m.userName ?? "-"}</td>
                    <td>{m.userEmail}</td>
                    <td>{m.phone ?? "-"}</td>
                    <td>{m.role}</td>
                    <td>{m.status}</td>
                    <td>
                      {m.joinedAt
                        ? new Date(m.joinedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="flex gap-2 justify-center">
                      <button
                        className="btn btn-xs btn-outline btn-info"
                        onClick={() => {
                          setSelectedUser(m);
                          setIsViewModalOpen(true);
                        }}
                      >
                        View
                      </button>

                      {canEdit && (
                        <button
                          className="btn btn-xs btn-outline btn-warning"
                          onClick={() => {
                            setSelectedUser(m);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedUser && (
        <ManagerShopUserViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          user={selectedUser}
          shopId={shopId}
          onUserUpdated={(updatedUser) => {
            setSelectedUser(updatedUser);
            onUserUpdated(updatedUser);
          }}
        />
      )}

      {/* Edit Modal */}
      {selectedUser && canEdit && (
        <ManagerShopUserEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          shopId={shopId}
          onUserUpdated={(updatedUser) => {
            setSelectedUser(updatedUser);
            onUserUpdated(updatedUser);
          }}
        />
      )}
    </Modal>
  );
}
