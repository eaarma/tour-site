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
    <div className="bg-base-200 min-h-screen p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <UserProfileInfoSection profile={profile} setProfile={setProfile} />
        <UserProfileOrdersSection profile={profile} />
      </div>
    </div>
  );
}
