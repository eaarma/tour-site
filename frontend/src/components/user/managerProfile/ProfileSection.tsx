"use client";

import { useState } from "react";
import {
  Award,
  Edit,
  Globe,
  Languages,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { UserResponseDto } from "@/types/user";

import EditProfileModal from "./ManagerEditProfileModal";

export default function ProfileSection({
  user,
  onProfileUpdated,
}: {
  user: UserResponseDto;
  onProfileUpdated: (updated: UserResponseDto) => void;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const displayName = user.name?.trim() || "Unnamed manager";
  const initials = displayName.charAt(0).toUpperCase();

  const experienceYears = Number(user.experience);

  const formattedExperience =
    user.experience && !isNaN(experienceYears)
      ? `${experienceYears} year${experienceYears !== 1 ? "s" : ""}`
      : "Not provided";
  const memberSince = user.createdAt
    ? new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : "Not available";

  if (!user) {
    return (
      <div className="rounded-[28px] border border-base-300 bg-base-100 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-base-content/60">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[28px] border border-base-300 bg-base-100 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${displayName} profile`}
                className="h-28 w-28 rounded-full border border-base-300 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-base-300 bg-primary/10 text-4xl font-semibold text-primary shadow-sm">
                {initials}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Guide Profile
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-base-content">
                {displayName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-base-content/60">
                Member since {memberSince}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="badge badge-outline border-base-300 bg-base-100 px-3 py-2 capitalize text-base-content">
                  {user.role.toLowerCase()}
                </span>
                <span className="badge border-primary/15 bg-primary/5 px-3 py-2 capitalize text-primary">
                  {user.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-outline h-11 gap-2 self-start"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={user.email}
          />
          <InfoCard
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={user.phone || "Not provided"}
          />
          <InfoCard
            icon={<Globe className="h-4 w-4" />}
            label="Nationality"
            value={user.nationality || "Not provided"}
          />
          <InfoCard
            icon={<Languages className="h-4 w-4" />}
            label="Languages"
            value={user.languages || "Not provided"}
          />
          <InfoCard
            icon={<Award className="h-4 w-4" />}
            label="Experience"
            value={formattedExperience}
          />
          <InfoCard
            icon={<UserRound className="h-4 w-4" />}
            label="Role"
            value={user.role}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/35 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>About</span>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-base-content/70">
            {user.bio || "No bio added yet."}
          </p>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={user}
        onProfileUpdated={onProfileUpdated}
      />
    </>
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
