"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TourService } from "@/lib/tourService";
import { Item, TourCreateDto } from "@/types";
import EditableSchedules from "@/components/manager/item/EditableSchedules";
import EditableLanguages from "@/components/manager/item/EditableLanguages";
import { DURATION_OPTIONS } from "@/utils/duration";
import { formatDuration } from "@/utils/formatDuration";
import { ArrowLeft } from "lucide-react";

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

  const [item, setItem] = useState<Item | null>(null);
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

  const handleSave = async () => {
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
        alert("Tour created! You can now add schedules.");

        // The page stays on the same route (itemId is still "new")
        // Optionally, you could update URL with actual id if you want
        // router.replace(`/manager/shops/${shopId}/items/${created.id}`);
      } else if (item) {
        // Update existing tour
        const dto: TourCreateDto = { ...form, shopId: item.shopId };
        const updated = await TourService.update(item.id, dto);
        setItem(updated);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to save", err);
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
          {/* Image */}
          <div className="lg:w-1/2">
            {isEditing || isNew ? (
              <div className="flex flex-col gap-2">
                {/* URL input (optional) */}
                <input
                  value={form.image || ""}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Image URL"
                  className="input input-bordered w-full"
                />

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="imageUpload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm({ ...form, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {/* Upload area */}
                <div
                  className={`
    relative cursor-pointer group rounded-xl overflow-hidden
    border-2 border-dashed border-gray-300
    hover:border-primary hover:bg-primary/10
    transition-all duration-200
  `}
                  onClick={() =>
                    document.getElementById("imageUpload")?.click()
                  }
                >
                  <img
                    src={form.image || "/images/placeholder-tour.jpg"}
                    alt={form.title || "Tour placeholder"}
                    className="w-full h-72 object-cover rounded-xl"
                  />

                  {/* Overlay (always visible, but stronger on hover) */}
                  <div
                    className={`
      absolute inset-0 flex flex-col items-center justify-center gap-2
      bg-black/30 group-hover:bg-black/50
      text-white text-center transition-colors duration-200
    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 opacity-80 group-hover:opacity-100"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4-4m0 0l-4 4m4-4v12"
                      />
                    </svg>
                    <span className="font-medium opacity-90 group-hover:opacity-100">
                      {form.image ? "Change image" : "Click to add image"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={item.image || "/images/placeholder-tour.jpg"}
                  alt={item.title}
                  className="rounded-xl w-full object-cover h-72 lg:h-full"
                />
                {!item.image && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                    <span className="text-white text-lg font-semibold">
                      No image yet
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:w-1/2 flex flex-col justify-between gap-4">
            <div>
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

              {isEditing ? (
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={form.description || ""}
                  placeholder="Description"
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              ) : (
                <p className="text-gray-600 mb-4">{item?.description}</p>
              )}

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
                  <span className="font-semibold">Price:</span>{" "}
                  {isEditing ? (
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={form.price || 0}
                      onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                      }
                    />
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
                  <span className="font-semibold">Max participants:</span>{" "}
                  {isEditing ? (
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={form.participants || 0}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          participants: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    item?.participants
                  )}
                </div>

                {/* Location */}
                <div className="col-span-2">
                  <span className="font-semibold">Location:</span>{" "}
                  {isEditing ? (
                    <input
                      className="input input-bordered w-full"
                      value={form.location || ""}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                    />
                  ) : (
                    item?.location
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
