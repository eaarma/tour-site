"use client";

import { useState } from "react";
import CardFrame from "@/components/common/CardFrame";
import { UserResponseDto } from "@/types/user";
import { Edit, Mail, Phone, Globe } from "lucide-react";
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

  return (
    <CardFrame>
      <div className="p-6 space-y-6 relative">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
            <p className="text-sm text-muted-foreground">
              Manage your personal information.
            </p>
          </div>

          <button
            className="btn btn-sm btn-outline flex items-center gap-1"
            onClick={() => setIsEditProfileModalOpen(true)}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Profile Header Block */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">
              Member since{" "}
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-GB")
                : "—"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-base-300" />

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoRow
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={profile.email}
          />

          <InfoRow
            icon={<Phone className="w-4 h-4" />}
            label="Phone"
            value={profile.phone || "Not provided"}
          />

          <InfoRow
            icon={<Globe className="w-4 h-4" />}
            label="Nationality"
            value={profile.nationality || "Not specified"}
          />
        </div>
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-1">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
