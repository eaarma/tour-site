"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import AdminUserModal from "@/components/admin/users/AdminUserModal";
import { Role, UserResponseDto } from "@/types/user";
import { ShopDto, ShopUserDto } from "@/types/shop";
import { ShopUserService } from "@/lib/shops/shopUserService";
import { UserService } from "@/lib/users/userService";

interface Props {
  shop: ShopDto | null;
  onClose: () => void;
  onSetStatus: () => void;
  setting: boolean;
}

const getStatusBadgeClass = (status?: string) => {
  if (status === "ACTIVE") return "badge-success";
  if (status === "DISABLED") return "badge-warning";
  return "badge-error";
};

const formatStatus = (status?: string) =>
  status ? status.charAt(0) + status.slice(1).toLowerCase() : "-";

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-base-content/45">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm font-medium text-base-content ${
          multiline ? "leading-6" : ""
        }`}
      >
        {value || <span className="font-normal text-base-content/45">-</span>}
      </p>
    </div>
  );
}

export default function AdminShopModal({
  shop,
  onClose,
  onSetStatus,
  setting,
}: Props) {
  const [shopUsers, setShopUsers] = useState<ShopUserDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(
    null,
  );
  const [editedRole, setEditedRole] = useState<Role>("USER");
  const [loadingSelectedUser, setLoadingSelectedUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    if (!shop) return;

    let mounted = true;
    setLoadingUsers(true);
    setUserError(null);

    ShopUserService.getUsersForShop(shop.id)
      .then((data) => {
        if (mounted) setShopUsers(data);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) setUserError("Failed to load related shop users.");
      })
      .finally(() => {
        if (mounted) setLoadingUsers(false);
      });

    return () => {
      mounted = false;
    };
  }, [shop]);

  const openUser = async (userId: string) => {
    setSelectedUser(null);
    setEditedRole("USER");
    setLoadingSelectedUser(true);

    try {
      const user = await UserService.getById(userId);
      setSelectedUser(user);
      setEditedRole(user.role);
    } catch (error) {
      console.error(error);
      setSelectedUser(null);
    } finally {
      setLoadingSelectedUser(false);
    }
  };

  const closeUserModal = () => {
    setSelectedUser(null);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    try {
      setSavingUser(true);
      await UserService.updateRole(selectedUser.id, editedRole);
      setSelectedUser({ ...selectedUser, role: editedRole });
    } catch (error) {
      console.error(error);
    } finally {
      setSavingUser(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!selectedUser) return;

    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      setSavingUser(true);
      await UserService.remove(selectedUser.id);
      setSelectedUser({ ...selectedUser, status: "REMOVED" });
    } catch (error) {
      console.error(error);
    } finally {
      setSavingUser(false);
    }
  };

  const handleReinstateUser = async () => {
    if (!selectedUser) return;

    try {
      setSavingUser(true);
      await UserService.reinstate(selectedUser.id);
      setSelectedUser({ ...selectedUser, status: "ACTIVE" });
    } catch (error) {
      console.error(error);
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <Modal isOpen={!!shop} onClose={onClose}>
      {shop ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-base-300 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                Shop details
              </p>
              <h3 className="mt-1 text-2xl font-bold text-base-content">
                {shop.name}
              </h3>
              <p className="mt-2 text-sm text-base-content/60">
                Shop ID{" "}
                <span className="font-mono text-base-content/75">
                  #{shop.id}
                </span>
              </p>
            </div>

            <span
              className={`badge badge-outline mr-8 ${getStatusBadgeClass(
                shop.status,
              )}`}
            >
              {formatStatus(shop.status)}
            </span>
          </div>

          <section>
            <h4 className="text-sm font-semibold text-base-content">
              Business information
            </h4>

            <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetailRow label="Name" value={shop.name} />

              <div className="sm:col-span-2">
                <DetailRow
                  label="Description"
                  value={shop.description}
                  multiline
                />
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-base-content">
              Bank information
            </h4>

            <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetailRow label="Account name" value={shop.bankAccountName} />
              <DetailRow label="IBAN" value={shop.bankAccountIban} />
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-base-content">
              Status information
            </h4>

            <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetailRow
                label="Current status"
                value={formatStatus(shop.status)}
              />
              <div className="sm:col-span-2">
                <DetailRow
                  label="Status reason"
                  value={shop.statusReason}
                  multiline
                />
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-base-content">
              Related shop users
            </h4>

            <div className="mt-4 overflow-x-auto rounded-3xl border border-base-200 bg-base-100 p-4">
              {loadingUsers ? (
                <p className="text-sm text-base-content/70">Loading users...</p>
              ) : userError ? (
                <p className="text-sm text-red-500">{userError}</p>
              ) : shopUsers.length === 0 ? (
                <p className="text-sm text-base-content/70">
                  No related users found.
                </p>
              ) : (
                <table className="table table-zebra w-full text-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopUsers.map((user) => (
                      <tr key={user.userId}>
                        <td>{user.userName || "-"}</td>
                        <td>{user.userEmail}</td>
                        <td>{user.role}</td>
                        <td>{user.status}</td>
                        <td>
                          {user.joinedAt
                            ? new Date(user.joinedAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => openUser(user.userId)}
                            disabled={loadingSelectedUser}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {selectedUser && (
            <AdminUserModal
              user={selectedUser}
              editedRole={editedRole}
              setEditedRole={setEditedRole}
              saving={savingUser}
              onClose={closeUserModal}
              onSaveRole={handleSaveRole}
              onRemove={handleRemoveUser}
              onReinstate={handleReinstateUser}
            />
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-base-300 pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={setting}
            >
              Close
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={setting}
              onClick={onSetStatus}
            >
              {setting ? "Setting status..." : "Set shop status"}
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
