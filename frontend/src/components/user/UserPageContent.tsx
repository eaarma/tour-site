"use client";

import { useEffect, useState } from "react";
import { UserResponseDto } from "@/types";
import { UserService } from "@/lib/userService";
import ManagerProfilePage from "./ManagerProfilePage";
import UserProfilePage from "./UserProfilePage";

export function UserPageContent() {
  const [profile, setProfile] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await UserService.getProfile();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  // At this point, user IS authenticated by RequireAuth
  if (!profile) {
    return <div className="p-6">Failed to load profile.</div>;
  }

  return profile.role === "MANAGER" ? (
    <ManagerProfilePage profile={profile} setProfile={setProfile} />
  ) : (
    <UserProfilePage profile={profile} setProfile={setProfile} />
  );
}
