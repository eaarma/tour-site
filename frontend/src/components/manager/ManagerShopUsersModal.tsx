"use client";

import { ShopUserDto } from "@/types";
import Modal from "../common/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  members: ShopUserDto[];
}

export default function ManagerShopUsersModal({
  isOpen,
  onClose,
  members,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="m-4">
        <h3 className="text-lg font-semibold mb-4">Shop Members</h3>
        {members.length === 0 ? (
          <p className="text-gray-500">No members found.</p>
        ) : (
          <div>
            <table className="table table-zebra w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Email</th>
                  <th className="px-2 py-1">Phone</th>
                  <th className="px-2 py-1">Role</th>
                  <th className="px-2 py-1">Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.userId}>
                    <td>{m.userName ?? "-"}</td>
                    <td>{m.userEmail}</td>
                    <td>{m.phone ?? "-"}</td>
                    <td>{m.role}</td>
                    <td>
                      {m.joinedAt
                        ? new Date(m.joinedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
