"use client";

import { ShopUserDto } from "@/types";
import Modal from "../common/Modal";
import { ShopUserService } from "@/lib/shopUserService";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pendingRequests: ShopUserDto[];
  shopId: number; // ✅ Added shopId
  onStatusChange: (userId: string, newStatus: string) => void;
}

export default function ManagerPendingRequestsModal({
  isOpen,
  onClose,
  pendingRequests,
  shopId,
  onStatusChange,
}: Props) {
  const handleAction = async (
    userId: string,
    status: "ACTIVE" | "DECLINED"
  ) => {
    try {
      // ✅ Pass shopId as the first argument
      await ShopUserService.updateStatus(shopId, userId, status);

      onStatusChange(userId, status);

      toast.success(
        status === "ACTIVE"
          ? "User confirmed and activated ✅"
          : "Request declined ❌"
      );
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="m-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Pending Requests ({pendingRequests.length})
          </h3>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req) => (
                <tr key={req.userId}>
                  <td>{req.userName ?? "-"}</td>
                  <td>{req.userEmail}</td>
                  <td>{req.phone ?? "-"}</td>
                  <td>{req.role}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-xs btn-success"
                      onClick={() => handleAction(req.userId, "ACTIVE")}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => handleAction(req.userId, "DECLINED")}
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}
