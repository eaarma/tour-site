"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TourService } from "@/lib/tourService";
import { Tour, TourCreateDto } from "@/types";
import EditableSchedules from "@/components/manager/item/EditableSchedules";
import EditableLanguages from "@/components/manager/item/EditableLanguages";
import { DURATION_OPTIONS } from "@/utils/duration";
import { formatDuration } from "@/utils/formatDuration";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { tourImageService } from "@/lib/tourImageService";
import { TourImage } from "@/types/tour";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const INTENSITY_OPTIONS = ["Easy", "Moderate", "Hard"];
const CATEGORY_OPTIONS = ["Nature", "History", "Culture"];
const STATUS_OPTIONS = ["ACTIVE", "ON_HOLD", "CANCELLED"];
const TYPE_OPTIONS = ["Walking", "Bus", "Boat", "Museum"];

export default function ManagerItemPage() {
  const params = useParams();
  const shopId = Number(params.shopId); //number
  const itemId = params.itemId;
  const router = useRouter();
  const [currentItemId, setCurrentItemId] = useState(itemId);
  const isNew = currentItemId === "new";

  const [item, setItem] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew); // in add mode, editing by default
  const [form, setForm] = useState<Partial<TourCreateDto>>(
    isNew
      ? {
          shopId,
          status: "ON_HOLD",
          category: CATEGORY_OPTIONS[0],
          type: TYPE_OPTIONS[0],
          intensity: INTENSITY_OPTIONS[0],
          timeRequired: 5,
          price: 0,
          participants: 1,
        }
      : {}
  );

  const [tourImages, setTourImages] = useState<TourImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Load item only if editing existing
  useEffect(() => {
    if (isNew) return;

    const fetchItem = async () => {
      try {
        const data = await TourService.getById(Number(itemId));
        setItem(data);
        setForm(data);
      } catch (err) {
        console.error("Failed to load item", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [isNew, itemId]);

  // Load images only for existing tours
  useEffect(() => {
    if (!isNew) {
      tourImageService
        .getImages(Number(itemId))
        .then(setTourImages)
        .catch(() => console.error("Failed to load tour images"));
    }
  }, [isNew, itemId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title || form.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters.";
    }

    if (!form.description || form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }

    if (!form.location || form.location.trim().length === 0) {
      newErrors.location = "Location is required.";
    }

    if (form.price === undefined || form.price <= 0) {
      newErrors.price = "Price must be greater than 0.";
    }

    if (!form.participants || form.participants < 1) {
      newErrors.participants = "Participants must be at least 1.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    try {
      if (isNew) {
        // Create new tour
        const dto: TourCreateDto = form as TourCreateDto;
        const created = await TourService.create(dto);

        // Instead of navigating, switch to edit mode
        setItem(created);
        setForm(created);
        setIsEditing(true);
        setCurrentItemId(String(created.id));

        // Optional: show a popup/notification
        toast.success(" Tour created! You can now add schedules.");

        // The page stays on the same route (itemId is still "new")
        // Optionally, you could update URL with actual id if you want
        // router.replace(`/manager/shops/${shopId}/items/${created.id}`);
      } else if (item) {
        // Update existing tour
        const dto: TourCreateDto = { ...form, shopId: item.shopId };
        const updated = await TourService.update(item.id, dto);
        setItem(updated);
        setIsEditing(false);

        toast.success("Tour updated successfully!");
      }
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const handleTourImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || (!item && !isNew)) return;

    setUploading(true);
    try {
      const fileRef = ref(storage, `tours/${item?.id || "temp"}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setUploadProgress(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
        },
        () => {
          toast.error("Upload failed");
          setUploading(false);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // If tour is newly created, store only locally for now
          if (isNew) {
            setTourImages((prev) => [
              ...prev,
              { id: Date.now(), imageUrl } as TourImage,
            ]);
          } else {
            const savedImage = await tourImageService.addImage(
              Number(itemId),
              imageUrl
            );
            setTourImages((prev) => [...prev, savedImage]);
          }

          toast.success("Image added");
          setUploading(false);
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await tourImageService.deleteImage(imageId);
      setTourImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image deleted");
    } catch {
      toast.error("Could not delete image");
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!isNew && !item) {
    return <div className="text-center mt-10 text-lg">Item not found</div>;
  }

  return (
    <main className="bg-base-200 min-h-screen p-6">
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isNew ? "Add Tour" : isEditing ? "Edit Tour" : "Tour Details"}
        </h1>

        <div className="flex gap-2">
          {/* ✅ Back Button */}
          <button
            onClick={() => router.push(`/shops/manager?shopId=${shopId}`)}
            className="btn btn-md btn-outline flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Edit / Cancel */}
          {!isNew && (
            <button
              className="btn btn-md btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          )}

          {/* Save */}
          {isEditing && (
            <button className="btn btn-md btn-success" onClick={handleSave}>
              Save
            </button>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="max-w-5xl mx-auto card bg-base-100 shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ✅ TOUR IMAGES SECTION */}
          <div className="lg:w-1/2">
            {isEditing || isNew ? (
              <div className="flex flex-col gap-4">
                {/* Upload Input */}
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleTourImageUpload}
                />

                <button
                  onClick={() =>
                    document.getElementById("imageUpload")?.click()
                  }
                  className="btn btn-outline btn-sm"
                >
                  + Upload Image
                </button>

                {/* Progress bar */}
                {uploading && (
                  <progress
                    className="progress progress-primary w-full"
                    value={uploadProgress}
                    max="100"
                  ></progress>
                )}

                {/* Image Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tourImages.length > 0 ? (
                    tourImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.imageUrl}
                          className="h-40 w-full object-cover rounded-lg"
                          alt="Tour"
                        />
                        <button
                          className="absolute top-2 right-2 btn btn-xs btn-error opacity-0 group-hover:opacity-100 transition"
                          onClick={() => handleDeleteImage(img.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No images uploaded yet.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {tourImages.length > 0 ? (
                  <img
                    src={tourImages[0].imageUrl}
                    alt="Main tour image"
                    className="rounded-xl w-full object-cover h-72"
                  />
                ) : (
                  <div className="h-72 w-full rounded-xl flex items-center justify-center bg-gray-200">
                    No image available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:w-1/2 flex flex-col justify-between gap-4">
            <div>
              {/* title */}
              {isEditing ? (
                <input
                  className="input input-bordered w-full text-3xl font-bold"
                  value={form.title || ""}
                  placeholder="Title"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              ) : (
                <h1 className="text-3xl font-bold mb-2">{item?.title}</h1>
              )}

              {/* Description */}
              <div className="col-span-2">
                <span className="font-semibold">Description:</span>
                {isEditing ? (
                  <div>
                    <textarea
                      className={`textarea textarea-bordered w-full ${
                        errors.description ? "textarea-error" : ""
                      }`}
                      placeholder="Description (min 10 characters)"
                      value={form.description || ""}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">{item?.description}</p>
                )}
              </div>

              {/* Status */}
              <div className="mb-2 mt-3">
                <span className="font-semibold mr-2">Status: </span>
                {isEditing || isNew ? (
                  <select
                    className="select select-bordered"
                    value={form.status || "ACTIVE"}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`badge ${
                      item?.status === "ACTIVE"
                        ? "badge-success"
                        : item?.status === "ON_HOLD"
                        ? "badge-warning"
                        : "badge-error"
                    }`}
                  >
                    {item?.status}
                  </span>
                )}
              </div>
              {/* Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Price */}
                <div>
                  <span className="font-semibold">Price:</span>
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        className={`input input-bordered w-full ${
                          errors.price ? "input-error" : ""
                        }`}
                        value={form.price || ""}
                        onChange={(e) =>
                          setForm({ ...form, price: Number(e.target.value) })
                        }
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>
                  ) : (
                    item?.price
                  )}
                </div>

                {/* Intensity */}
                <div>
                  <span className="font-semibold">Intensity:</span>{" "}
                  {isEditing ? (
                    <select
                      className="select select-bordered w-full"
                      value={form.intensity || ""}
                      onChange={(e) =>
                        setForm({ ...form, intensity: e.target.value })
                      }
                    >
                      {INTENSITY_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    item?.intensity
                  )}
                </div>

                {/* Category */}
                <div>
                  <span className="font-semibold">Category:</span>{" "}
                  {isEditing ? (
                    <select
                      className="select select-bordered w-full"
                      value={form.category || CATEGORY_OPTIONS[0]}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item?.category
                  )}
                </div>

                {/* Type */}
                <div>
                  <span className="font-semibold">Type:</span>{" "}
                  {isEditing ? (
                    <select
                      className="select select-bordered w-full"
                      value={form.type || TYPE_OPTIONS[0]}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item?.type
                  )}
                </div>

                {/* Duration */}

                <div>
                  <span className="font-semibold">Duration:</span>
                  {isEditing ? (
                    <select
                      className="select select-bordered w-full"
                      value={form.timeRequired ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          timeRequired: Number(e.target.value),
                        })
                      }
                    >
                      {DURATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    " " + formatDuration(item?.timeRequired)
                  )}
                </div>

                {/* Participants */}
                <div>
                  <span className="font-semibold">Max Participants:</span>
                  {isEditing ? (
                    <div>
                      <select
                        className={`select select-bordered w-full ${
                          errors.participants ? "select-error" : ""
                        }`}
                        value={form.participants || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            participants: Number(e.target.value),
                          })
                        }
                      >
                        <option value="">Select...</option>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(
                          (num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          )
                        )}
                      </select>
                      {errors.participants && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.participants}
                        </p>
                      )}
                    </div>
                  ) : (
                    item?.participants
                  )}
                </div>

                {/* Location */}
                <div className="col-span-2">
                  <span className="font-semibold">Location:</span>
                  {isEditing ? (
                    <div>
                      <input
                        className={`input input-bordered w-full ${
                          errors.location ? "input-error" : ""
                        }`}
                        placeholder="Location (required)"
                        value={form.location || ""}
                        onChange={(e) =>
                          setForm({ ...form, location: e.target.value })
                        }
                      />
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  ) : (
                    item?.location || (
                      <span className="text-gray-500">No location set</span>
                    )
                  )}
                </div>

                {/* Languages */}
                <div className="col-span-2">
                  <span className="font-semibold">Languages:</span>
                  {isEditing ? (
                    <EditableLanguages
                      value={(form.language || "")
                        .split(",")
                        .map((l) => l.trim())
                        .filter(Boolean)}
                      onChange={(langs) =>
                        setForm({ ...form, language: langs.join(", ") })
                      }
                      isEditing={isEditing}
                    />
                  ) : (
                    " " + item?.language
                  )}
                </div>

                {/* Schedules */}
                {item && (
                  <div className="col-span-2 mt-4">
                    <EditableSchedules
                      tourId={item!.id}
                      isEditing={isEditing}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
