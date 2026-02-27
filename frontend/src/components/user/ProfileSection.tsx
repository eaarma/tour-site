"use client";

import { useState } from "react";
import { UserResponseDto } from "@/types/user";
import EditProfileModal from "./ManagerEditProfileModal";
import { Edit, Mail, Phone, Globe, Languages, Award } from "lucide-react";

export default function ProfileSection({
  user,
  onProfileUpdated,
}: {
  user: UserResponseDto;
  onProfileUpdated: (updated: UserResponseDto) => void;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const experienceYears = Number(user.experience);

  const formattedExperience =
    user.experience && !isNaN(experienceYears)
      ? `${experienceYears} year${experienceYears !== 1 ? "s" : ""}`
      : "-";

  if (!user) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm p-6 space-y-8">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Avatar + Name */}
          <div className="flex items-center gap-5">
            <img
              src={user.profileImageUrl || "/images/default-user.png"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border border-base-300 shadow-sm"
            />

            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {user.name}
              </h2>

              {user.createdAt && (
                <p className="text-sm text-muted-foreground mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Edit button */}
          <button
            className="btn btn-sm btn-outline flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* ===== CONTACT + DETAILS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Card */}
          <div className="rounded-lg border border-base-200 p-4 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Contact
            </h3>

            <InfoRow
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={user.email}
            />

            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={user.phone || "Not provided"}
            />

            <InfoRow
              icon={<Globe className="w-4 h-4" />}
              label="Nationality"
              value={user.nationality || "-"}
            />
          </div>

          {/* Professional Info Card */}
          <div className="rounded-lg border border-base-200 p-4 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Professional
            </h3>

            <InfoRow
              icon={<Languages className="w-4 h-4" />}
              label="Languages"
              value={user.languages || "-"}
            />

            <InfoRow
              icon={<Award className="w-4 h-4" />}
              label="Experience"
              value={formattedExperience}
            />
          </div>
        </div>

        {/* ===== BIO ===== */}
        <div className="rounded-lg border border-base-200 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            About
          </h3>

          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
            {user.bio || "No bio added yet."}
          </p>
        </div>
      </div>

      {/* Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={user}
        onProfileUpdated={onProfileUpdated}
      />
    </>
  );
}

/* ======================
   Reusable Info Row
====================== */

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

      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
