"use client";

import { useEffect, useState } from "react";
import { UserResponseDto } from "@/types";
import { UserService } from "@/lib/users/userService";
import ManagerProfilePage from "./managerProfile/ManagerProfilePage";
import UserProfilePage from "./userProfile/UserProfilePage";

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
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="mt-5 text-lg font-semibold text-base-content">
              Loading profile
            </p>
            <p className="mt-2 text-sm text-base-content/60">
              We&apos;re preparing your account details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
            <p className="text-lg font-semibold text-base-content">
              Failed to load profile
            </p>
            <p className="mt-2 text-sm text-base-content/60">
              Please refresh the page and try again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return profile.role === "MANAGER" ? (
    <ManagerProfilePage profile={profile} setProfile={setProfile} />
  ) : (
    <UserProfilePage profile={profile} setProfile={setProfile} />
  );
}

