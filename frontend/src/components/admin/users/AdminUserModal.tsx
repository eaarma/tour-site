"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import Modal from "@/components/common/Modal";
import { Role, UserResponseDto } from "@/types/user";
import { ShopUserStatusDto } from "@/types/shop";
import { ShopUserService } from "@/lib/shops/shopUserService";

type Props = {
  user: UserResponseDto | null;
  editedRole: Role;
  setEditedRole: (role: Role) => void;
  saving: boolean;
  onClose: () => void;
  onSaveRole: () => void;
  onRemove: () => void;
  onReinstate: () => void;
};

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
          multiline ? "whitespace-pre-line leading-6" : ""
        }`}
      >
        {value || <span className="font-normal text-base-content/45">-</span>}
      </p>
    </div>
  );
}

function formatStatus(status?: string) {
  if (!status) return "-";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusBadgeClass(status?: UserResponseDto["status"]) {
  return status === "ACTIVE" ? "badge-success" : "badge-error";
}

export default function AdminUserModal({
  user,
  editedRole,
  setEditedRole,
  saving,
  onClose,
  onSaveRole,
  onRemove,
  onReinstate,
}: Props) {
  const [shops, setShops] = useState<ShopUserStatusDto[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [shopsError, setShopsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    setLoadingShops(true);
    setShopsError(null);

    ShopUserService.getShopsForUser(user.id)
      .then((data) => {
        if (mounted) setShops(data);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) setShopsError("Failed to load shops for this user.");
      })
      .finally(() => {
        if (mounted) setLoadingShops(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) return null;

  const roleChanged = editedRole !== user.role;
  const displayName = user.name || user.email;

  return (
    <Modal isOpen={!!user} onClose={onClose}>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 border-b border-base-300 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-base-300 bg-base-200">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-base-content/60">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                User details
              </p>

              <h3 className="mt-1 truncate text-2xl font-bold text-base-content">
                {displayName}
              </h3>

              <p className="mt-2 truncate text-sm text-base-content/60">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end mr-8">
            <span
              className={`badge badge-outline ${getStatusBadgeClass(user.status)}`}
            >
              {formatStatus(user.status)}
            </span>
            <span className="badge badge-outline">{user.role}</span>
          </div>
        </header>

        <section>
          <h4 className="text-sm font-semibold text-base-content">
            Account information
          </h4>

          <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailRow label="User ID" value={user.id} />
            <DetailRow label="Status" value={formatStatus(user.status)} />
            <DetailRow label="Role" value={user.role} />
            <DetailRow label="Created at" value={formatDate(user.createdAt)} />
          </div>
        </section>

        <section className="border-t border-base-300 pt-5">
          <h4 className="text-sm font-semibold text-base-content">
            Contact details
          </h4>

          <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailRow label="Name" value={user.name} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone" value={user.phone} />
            <DetailRow label="Nationality" value={user.nationality} />
          </div>
        </section>

        <section className="border-t border-base-300 pt-5">
          <h4 className="text-sm font-semibold text-base-content">
            Profile details
          </h4>

          <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailRow label="Experience" value={user.experience} />
            <DetailRow label="Languages" value={user.languages} />

            <div className="sm:col-span-2">
              <DetailRow label="Bio" value={user.bio} multiline />
            </div>
          </div>
        </section>

        <section className="border-t border-base-300 pt-5">
          <h4 className="text-sm font-semibold text-base-content">
            Shops this user belongs to
          </h4>

          <div className="mt-4 overflow-x-auto rounded-3xl border border-base-200 bg-base-100 p-4">
            {loadingShops ? (
              <p className="text-sm text-base-content/70">Loading shops...</p>
            ) : shopsError ? (
              <p className="text-sm text-red-500">{shopsError}</p>
            ) : shops.length === 0 ? (
              <p className="text-sm text-base-content/70">
                This user is not associated with any shops.
              </p>
            ) : (
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr key={shop.shopId}>
                      <td>{shop.shopName}</td>
                      <td>{shop.role}</td>
                      <td>{shop.status}</td>
                      <td>
                        {shop.joinedAt
                          ? new Date(shop.joinedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-base-300 bg-base-200/25 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-base-content">
                Update role
              </label>
              <p className="text-sm text-base-content/60">
                Adjust this user&apos;s platform permissions.
              </p>

              <select
                className="select select-bordered mt-2 w-full"
                value={editedRole}
                onChange={(event) => setEditedRole(event.target.value as Role)}
              >
                <option value="USER">USER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={saving || !roleChanged}
              onClick={onSaveRole}
            >
              {saving ? "Saving..." : "Save role"}
            </button>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-base-300 pt-5 sm:flex-row sm:justify-between">
          <button
            type="button"
            className="btn btn-error btn-outline"
            disabled={saving}
            onClick={user.status === "REMOVED" ? onReinstate : onRemove}
          >
            {user.status === "REMOVED" ? "Reinstate user" : "Remove user"}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={saving}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
