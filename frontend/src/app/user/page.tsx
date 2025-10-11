"use client";

import { useAuth } from "@/hooks/useAuth";
import ManagerProfilePage from "@/components/user/ManagerProfilePage";
import UserProfilePage from "@/components/user/UserProfilePage";

export default function UserPage() {
  const { user, role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div className="p-6">Please log in to view your profile.</div>;
  }

  if (!role) {
    return <div className="p-6">Loading profile...</div>;
  }

  return role === "MANAGER" ? (
    <ManagerProfilePage user={user} />
  ) : (
    <UserProfilePage user={user} />
  );
}
