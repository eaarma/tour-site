"use client";

import { useEffect, useRef, useState } from "react";
import { UserService } from "@/lib/users/userService";
import { Role, UserResponseDto } from "@/types/user";
import toast from "react-hot-toast";
import Pagination from "../../common/Pagination";
import AdminUserModal from "./AdminUserModal";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "REMOVED">("ACTIVE");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const hasLoadedOnce = useRef(false);

  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(
    null,
  );
  const [editedRole, setEditedRole] = useState<Role>("USER");
  const [saving, setSaving] = useState(false);

  const openUser = (user: UserResponseDto) => {
    setSelectedUser(user);
    setEditedRole(user.role);
  };

  useEffect(() => {
    let isActive = true;
    const isInitialLoad = !hasLoadedOnce.current;

    const timeout = setTimeout(async () => {
      try {
        if (isInitialLoad) setLoading(true);
        else setRefreshing(true);

        const data = await UserService.getAll({
          query,
          status,
          page,
          size: 10,
        });

        if (!isActive) return;

        setUsers(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (!isActive) return;
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        if (!isActive) return;
        hasLoadedOnce.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    }, isInitialLoad ? 0 : 300);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [page, query, status]);

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    if (selectedUser.role === editedRole) {
      toast("No changes made");
      return;
    }

    try {
      setSaving(true);

      await UserService.updateRole(selectedUser.id, editedRole);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: editedRole } : u,
        ),
      );

      setSelectedUser((prev) => (prev ? { ...prev, role: editedRole } : prev));

      toast.success("Role changed successfully");
    } catch {
      toast.error("Failed to change role");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedUser) return;
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      await UserService.remove(selectedUser.id);

      if (status === "ACTIVE") {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, status: "REMOVED" } : u,
          ),
        );
      }

      setSelectedUser(null);
      toast.success("User removed");
    } catch {
      toast.error("Failed to remove user");
    }
  };

  if (loading) {
    return <div className="card bg-base-100 p-6">Loading users...</div>;
  }

  return (
    <div className="card bg-base-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Management</h2>
        {refreshing && (
          <span className="text-sm opacity-70">Refreshing...</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="input input-bordered w-full sm:max-w-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="select select-bordered w-full sm:w-48"
          value={status}
          onChange={(e) => setStatus(e.target.value as "ACTIVE" | "REMOVED")}
        >
          <option value="ACTIVE">Active Users</option>
          <option value="REMOVED">Removed Users</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      user.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                    }`}
                    title={user.status}
                  />
                </td>
                <td>{user.email}</td>
                <td>{user.name || "-"}</td>
                <td>{user.role}</td>
                <td className="text-right">
                  <button className="btn btn-sm" onClick={() => openUser(user)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selectedUser && (
        <AdminUserModal
          user={selectedUser}
          editedRole={editedRole}
          setEditedRole={setEditedRole}
          saving={saving}
          onClose={() => setSelectedUser(null)}
          onSaveRole={handleSaveRole}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
}

