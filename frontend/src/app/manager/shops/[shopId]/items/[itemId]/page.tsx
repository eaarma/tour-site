"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TourService } from "@/lib/tourService";
import { Item, TourCreateDto } from "@/types";
import EditableSchedules from "@/components/manager/item/EditableSchedules";
import EditableLanguages from "@/components/manager/item/EditableLanguages";

const INTENSITY_OPTIONS = ["Easy", "Moderate", "Hard"];
const CATEGORY_OPTIONS = ["Nature", "History", "Culture"];
const STATUS_OPTIONS = ["Active", "Cancelled"];
const TYPE_OPTIONS = ["Walking", "Bus", "Boat", "Museum"];

export default function ManagerItemPage() {
  const { itemId } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<Partial<TourCreateDto>>({});

  useEffect(() => {
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
  }, [itemId]);

  const handleSave = async () => {
    if (!item) return;
    const dto: TourCreateDto = {
      ...form,
      shopId: item.shopId,
    } as TourCreateDto;

    try {
      const updated = await TourService.update(item.id, dto);
      setItem(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (!item)
    return <div className="text-center mt-10 text-lg">Item not found</div>;

  return (
    <main className="bg-base-200 min-h-screen p-6">
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
        <button
          className="btn btn-md btn-primary"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
        {isEditing && (
          <button className="btn btn-md btn-success" onClick={handleSave}>
            Save
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto card bg-base-100 shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="lg:w-1/2">
            {isEditing ? (
              <input
                value={form.image || ""}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input input-bordered w-full"
              />
            ) : (
              <img
                src={item.image}
                alt={item.title}
                className="rounded-xl w-full object-cover h-72 lg:h-full"
              />
            )}
          </div>

          {/* Details */}
          <div className="lg:w-1/2 flex flex-col justify-between gap-4">
            <div>
              {isEditing ? (
                <input
                  className="input input-bordered w-full text-3xl font-bold"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              ) : (
                <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              )}

              {isEditing ? (
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              ) : (
                <p className="text-gray-600 mb-4">{item.description}</p>
              )}

              {/* Status (badge in preview) */}
              <div className="mb-2">
                <span className="font-semibold">Status: </span>
                {isEditing ? (
                  <select
                    className="select select-bordered"
                    value={form.status || ""}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`badge ${
                      item.status === "ACTIVE" ? "badge-success" : "badge-error"
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </div>

              {/* Grid of fields */}
              <div className="grid grid-cols-2 gap-2 text-sm">
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
                    item.price
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
                    item.intensity
                  )}
                </div>

                {/* Category */}
                <div>
                  <span className="font-semibold">Category:</span>{" "}
                  {isEditing ? (
                    <select
                      className="select select-bordered w-full"
                      value={form.category || ""}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    item.category
                  )}
                </div>

                {/* Type (edit only) */}
                {isEditing && (
                  <div>
                    <span className="font-semibold">Type:</span>{" "}
                    <select
                      className="select select-bordered w-full"
                      value={form.type || ""}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <span className="font-semibold">Duration:</span>
                  {isEditing ? (
                    <select
                      className="select select-bordered w-full"
                      value={form.timeRequired || ""}
                      onChange={(e) =>
                        setForm({ ...form, timeRequired: e.target.value })
                      }
                    >
                      {/* Short durations: 5 to 60 minutes in 5-min increments */}
                      {Array.from({ length: 12 }, (_, i) => (i + 1) * 5).map(
                        (min) => (
                          <option key={min} value={`${min} minutes`}>
                            {min} minutes
                          </option>
                        )
                      )}

                      {/* Hourly durations */}
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={`${h} hour${h > 1 ? "s" : ""}`}>
                          {h} hour{h > 1 ? "s" : ""}
                        </option>
                      ))}

                      <option value="Full day">Full day</option>

                      {/* Multiple days */}
                      {Array.from({ length: 5 }, (_, i) => i + 2).map((d) => (
                        <option key={d} value={`${d} days`}>
                          {d} days
                        </option>
                      ))}

                      <option value="1 week">1 week</option>
                    </select>
                  ) : (
                    " " + item.timeRequired
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
                    item.participants
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
                    item.location
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
                    " " + item.language
                  )}
                </div>

                {/* Schedules */}
                <div className="col-span-2 mt-4">
                  <EditableSchedules tourId={item.id} isEditing={isEditing} />{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
