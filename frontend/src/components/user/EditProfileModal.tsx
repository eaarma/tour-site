"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { UserResponseDto, UserUpdateDto } from "@/types/user";
import { UserService } from "@/lib/userService";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: UserResponseDto;
  onProfileUpdated: (updated: UserResponseDto) => void;
}) {
  const [formData, setFormData] = useState<UserUpdateDto>({
    name: profile.name,
    phone: profile.phone ?? "",
    nationality: profile.nationality ?? "",
    bio: profile.bio ?? "",
    experience: profile.experience ?? "",
    languages: profile.languages ?? "",
    profileImageUrl: profile.profileImageUrl ?? "",
  });

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      setUploadProgress(0);

      const fileRef = ref(storage, `profile-images/${profile.id}-${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast.error("Failed to upload image.");
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData((prev) => ({ ...prev, profileImageUrl: url }));
          toast.success("Image uploaded successfully!");
          setUploading(false);
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading image.");
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await UserService.updateProfile(formData);

      onProfileUpdated(updated); // ✅ live update on parent
      toast.success("Profile updated successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

        {/* Image Section */}
        <div className="flex flex-col items-center mb-4">
          {formData.profileImageUrl ? (
            <img
              src={formData.profileImageUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-2">
              No Image
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-sm file-input-bordered w-full max-w-xs"
          />

          {uploading && (
            <div className="w-full mt-2">
              <progress
                className="progress progress-primary w-full"
                value={uploadProgress}
                max="100"
              />
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text font-medium">Name</span>
            <input
              type="text"
              name="name"
              className="input input-bordered input-sm"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

          <label className="form-control">
            <span className="label-text font-medium">Phone</span>
            <input
              type="text"
              name="phone"
              className="input input-bordered input-sm"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>

          <label className="form-control">
            <span className="label-text font-medium">Nationality</span>
            <input
              type="text"
              name="nationality"
              className="input input-bordered input-sm"
              value={formData.nationality}
              onChange={handleChange}
            />
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label-text font-medium">Bio</span>
            <textarea
              name="bio"
              className="textarea textarea-bordered textarea-sm"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
            />
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label-text font-medium">Experience (years)</span>
            <input
              type="number"
              name="experience"
              className="input input-bordered input-sm"
              value={formData.experience}
              onChange={handleChange}
            />
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label-text font-medium">Languages</span>
            <input
              type="text"
              name="languages"
              className="input input-bordered input-sm"
              value={formData.languages}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="btn btn-outline btn-sm"
            onClick={onClose}
            disabled={saving || uploading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
