"use client";

import { useState } from "react";
import { Edit, Globe, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

import CardFrame from "@/components/common/CardFrame";
import { UserResponseDto } from "@/types/user";

import UserEditProfileModal from "./UserEditProfileModal";

interface UserProfileInfoSectionProps {
  profile: UserResponseDto;
  setProfile: React.Dispatch<React.SetStateAction<UserResponseDto | null>>;
}

export default function UserProfileInfoSection({
  profile,
  setProfile,
}: UserProfileInfoSectionProps) {
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const displayName = profile.name?.trim() || "Unnamed user";
  const initials = displayName.charAt(0).toUpperCase();
  const memberSince = profile.createdAt
    ? new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }).format(new Date(profile.createdAt))
    : "Not available";

  return (
    <CardFrame>
      <div className="px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={`${displayName} profile`}
                className="h-24 w-24 rounded-full border border-base-300 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-base-300 bg-primary/10 text-3xl font-semibold text-primary shadow-sm">
                {initials}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Account Details
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-base-content">
                {displayName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-base-content/60">
                Member since {memberSince}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="badge badge-outline border-base-300 bg-base-100 px-3 py-2 capitalize text-base-content">
                  {profile.role.toLowerCase()}
                </span>
                <span className="badge border-primary/15 bg-primary/5 px-3 py-2 capitalize text-primary">
                  {profile.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-outline h-11 gap-2 self-start"
            onClick={() => setIsEditProfileModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={profile.email}
          />
          <InfoCard
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={profile.phone || "Not provided"}
          />
          <InfoCard
            icon={<Globe className="h-4 w-4" />}
            label="Nationality"
            value={profile.nationality || "Not specified"}
          />
          <InfoCard
            icon={<UserRound className="h-4 w-4" />}
            label="Role"
            value={profile.role}
          />
        </div>

        {profile.bio && (
          <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/35 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>About</span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-base-content/70">
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      <UserEditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profile={profile}
        setProfile={setProfile}
      />
    </CardFrame>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/50">
        <span className="text-primary">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-base-content">
        {value}
      </p>
    </div>
  );
}
