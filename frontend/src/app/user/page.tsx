"use client";

import { useEffect, useState } from "react";
import { UserService } from "@/lib/userService";
import { UserResponseDto } from "@/types/user";
import ManagerProfilePage from "@/components/user/ManagerProfilePage";
import UserProfilePage from "@/components/user/UserProfilePage";

export default function UserPage() {
  const [profile, setProfile] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await UserService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading || !profile) {
    return <div className="p-6">Loading profile...</div>;
  }

  return profile.role === "MANAGER" ? (
    <ManagerProfilePage profile={profile} setProfile={setProfile} />
  ) : (
    <UserProfilePage profile={profile} setProfile={setProfile} />
  );
}
