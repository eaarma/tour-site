"use client";

import { UserResponseDto } from "@/types/user";
import UserProfileInfoSection from "./UserProfileInfoSection";
import UserProfileOrdersSection from "./UserProfileOrdersSection";

interface UserProfilePageProps {
  profile: UserResponseDto;
  setProfile: React.Dispatch<React.SetStateAction<UserResponseDto | null>>;
}

export default function UserProfilePage({
  profile,
  setProfile,
}: UserProfilePageProps) {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                Account
              </p>
              <h1 className="mt-3 text-3xl font-bold text-base-content">
                Your Profile
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/65">
                Keep your details up to date and review your tours from one
                place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="badge badge-outline border-base-300 bg-base-100/80 px-4 py-3 capitalize text-base-content">
                {profile.role.toLowerCase()}
              </span>
              <span className="badge badge-outline border-base-300 bg-base-100/80 px-4 py-3 capitalize text-base-content">
                {profile.status.toLowerCase()}
              </span>
            </div>
          </div>
        </section>

        <UserProfileInfoSection profile={profile} setProfile={setProfile} />
        <UserProfileOrdersSection profile={profile} />
      </div>
    </main>
  );
}
