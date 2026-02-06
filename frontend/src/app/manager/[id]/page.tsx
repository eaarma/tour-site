"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { UserService } from "@/lib/userService";
import { UserResponseDto } from "@/types/user";
import CardFrame from "@/components/common/CardFrame";
import BackButton from "@/components/common/BackButton";

export default function PublicManagerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [manager, setManager] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const data = await UserService.getById(id);
        setManager(data);
      } catch (err) {
        console.error("Failed to fetch manager profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchManager();
  }, [id]);

  if (loading) return <div className="p-6">Loading guide profile...</div>;
  if (!manager) return <div className="p-6">Guide not found.</div>;

  const imageUrl =
    manager.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      manager.name,
    )}&background=random`;

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <CardFrame>
          <div className="p-6 flex flex-col items-center text-center space-y-6">
            {/* Profile Image */}
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`${manager.name}'s profile image`}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold">{manager.name}</h1>
              {manager.nationality && (
                <p className="text-gray-500 mt-1">{manager.nationality}</p>
              )}
              <p className="text-sm text-gray-400">
                Joined{" "}
                {new Date(manager.createdAt || "").toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>

            {/* Bio */}
            {manager.bio && (
              <p className="max-w-lg text-gray-700 italic text-sm">
                {manager.bio}
              </p>
            )}

            <div className="divider" />

            {/* Additional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
              {manager.experience && (
                <div>
                  <p className="font-semibold text-sm text-gray-600">
                    Experience
                  </p>
                  <p>{manager.experience} years</p>
                </div>
              )}

              {manager.languages && (
                <div>
                  <p className="font-semibold text-sm text-gray-600">
                    Languages
                  </p>
                  <p>{manager.languages}</p>
                </div>
              )}

              {manager.phone && (
                <div>
                  <p className="font-semibold text-sm text-gray-600">Phone</p>
                  <p>{manager.phone}</p>
                </div>
              )}

              <div>
                <p className="font-semibold text-sm text-gray-600">Email</p>
                <p>{manager.email}</p>
              </div>
            </div>
          </div>
        </CardFrame>
      </div>
    </div>
  );
}
