"use client";

import { useState } from "react";
import CardFrame from "@/components/common/CardFrame";
import { UserResponseDto } from "@/types/user";
import { Edit } from "lucide-react";
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
      <div className="p-6 relative">
        {/* ✅ Edit button */}
        <button
          className="btn btn-sm btn-outline absolute top-4 right-4 flex items-center gap-1"
          onClick={() => setIsEditProfileModalOpen(true)}
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>

        <h2 className="text-2xl font-bold mb-4">Your Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Name</p>
            <p>{profile.name || "—"}</p>
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p>{profile.email}</p>
          </div>
          <div>
            <p className="font-semibold">Phone</p>
            <p>{profile.phone || "—"}</p>
          </div>
          <div>
            <p className="font-semibold">Nationality</p>
            <p>{profile.nationality || "—"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold">Member Since</p>
            <p>
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-GB")
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Edit Profile Modal */}
      <UserEditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profile={profile}
        setProfile={setProfile}
      />
    </CardFrame>
  );
}
