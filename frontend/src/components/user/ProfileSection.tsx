"use client";

import { useState } from "react";
import { UserResponseDto } from "@/types/user";
import EditProfileModal from "./EditProfileModal";
import { Edit } from "lucide-react";

export default function ProfileSection({
  user,
  onProfileUpdated,
}: {
  user: UserResponseDto | null;
  onProfileUpdated: (updated: UserResponseDto) => void;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✅ Safe-guard: wait for user to load
  if (!user) {
    return (
      <div className="card bg-base-100 shadow-lg p-6 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
      {/* Profile Image */}
      <div className="flex flex-col items-center">
        <img
          src={user.profileImageUrl || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border shadow-sm"
        />
        <p className="mt-2 text-sm text-gray-500">
          Member since:{" "}
          <span className="font-medium">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </p>
      </div>

      {/* Profile Info */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <button
            className="btn btn-sm btn-outline flex items-center gap-1"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <p>
          <span className="font-medium text-gray-600">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-medium text-gray-600">Phone:</span>{" "}
          {user.phone || "Not provided"}
        </p>
        <p>
          <span className="font-medium text-gray-600">Nationality:</span>{" "}
          {user.nationality || "-"}
        </p>
        <p>
          <span className="font-medium text-gray-600">Languages:</span>{" "}
          {user.languages || "-"}
        </p>
        <p>
          <span className="font-medium text-gray-600">Experience:</span>{" "}
          {user.experience ? `${user.experience} years` : "-"}
        </p>
        <p>
          <span className="font-medium text-gray-600">Bio:</span>{" "}
          {user.bio || "No bio yet."}
        </p>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={user}
        onProfileUpdated={onProfileUpdated}
      />
    </div>
  );
}
