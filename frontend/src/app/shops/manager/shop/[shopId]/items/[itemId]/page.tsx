"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShopService } from "@/lib/shops/shopService";
import { TourService } from "@/lib/tours/tourService";
import { Tour, TourCreateDto } from "@/types";
import EditableSchedules from "@/components/manager/item/EditableSchedules";
import EditableLanguages from "@/components/manager/item/EditableLanguages";
import { DURATION_OPTIONS } from "@/utils/duration";
import { formatDuration } from "@/utils/formatDuration";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { TourImageService } from "@/lib/tours/tourImageService";
import {
  TourCategory,
  TourFormDto,
  TourImage,
  TourUpdateDto,
} from "@/types/tour";

import TourImagesManager from "@/components/manager/item/TourImagesManager";
import CategorySelector from "@/components/manager/shop/CategorySelector";
import Unauthorized from "@/components/common/Unauthorized";
import { useShopAccess } from "@/hooks/useShopAccess";

const INTENSITY_OPTIONS = ["Easy", "Moderate", "Hard"];
const STATUS_OPTIONS = ["ACTIVE", "ON_HOLD", "CANCELLED"];
const TYPE_OPTIONS = ["PRIVATE", "PUBLIC"];

export default function ManagerItemPage() {
  const params = useParams();
  const shopId = Number(params.shopId); //number
  const itemId = params.itemId as string;
  const router = useRouter();
  const access = useShopAccess(shopId ?? 0);

  const isNew = itemId === "new";

  const [item, setItem] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew); // in add mode, editing by default
  const [shopStatus, setShopStatus] = useState<
    "ACTIVE" | "REMOVED" | "DISABLED" | null
  >(null);
  const [form, setForm] = useState<TourFormDto>(
    isNew
      ? {
          shopId,
          status: "ON_HOLD",
          categories: [],
          type: TYPE_OPTIONS[0],
          intensity: INTENSITY_OPTIONS[0],
          timeRequired: 5,
          price: 0,
          participants: 1,
        }
      : {},
  );

  const [tourImages, setTourImages] = useState<TourImage[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load the item only when editing an existing tour.
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

  useEffect(() => {
    if (!shopId || access !== true) return;

    const loadShop = async () => {
      try {
        const shop = await ShopService.getById(shopId);
        setShopStatus(shop.status);
      } catch (err) {
        console.error("Failed to load shop status", err);
      }
    };

    loadShop();
  }, [shopId, access]);

  useEffect(() => {
    if (shopStatus === "REMOVED" || shopStatus === "DISABLED") {
      setIsEditing(false);
    }
  }, [shopStatus]);

  // Load images only for existing tours
  useEffect(() => {
    if (!isNew) {
      TourImageService.getImages(Number(itemId))
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

    if (!form.language || form.language.length === 0) {
      newErrors.language = "At least one language is required.";
    }

    if (form.type === "PUBLIC" && form.language && form.language.length !== 1) {
      newErrors.language = "Public tours must have exactly one language.";
    }

    if (form.type === "PRIVATE" && form.language && form.language.length < 1) {
      newErrors.language = "Private tours must have at least one language.";
    }

    if (!form.meetingPoint) {
      newErrors.meetingPoint = "Meeting point has to be filled";
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
        // Create a new tour.
        const dto: TourCreateDto = {
          shopId: form.shopId!,
          title: form.title!,
          description: form.description!,
          location: form.location!,
          images: form.images ?? [],
          price: form.price!,
          timeRequired: form.timeRequired!,
          intensity: form.intensity!,
          participants: form.participants!,
          categories: (form.categories ?? []).map((c) => c as TourCategory),
          language: form.language!,
          type: form.type!,
          meetingPoint: form.meetingPoint!,
          status: form.status!,
        };

        const created = await TourService.create(dto);

        // Instead of navigating, switch to edit mode
        setItem(created);
        setForm(created);
        setIsEditing(true);

        toast.success("Tour created! You can now add schedules.");

        // The page stays on the same route (itemId is still "new")
        router.replace(`/shops/manager/shop/${shopId}/items/${created.id}`);
      } else if (item) {
        // Update the existing tour.
        const dto: TourUpdateDto = {
          shopId: item.shopId,
          title: form.title!,
          description: form.description!,
          location: form.location!,
          images: form.images ?? [],
          price: form.price!,
          timeRequired: form.timeRequired!,
          intensity: form.intensity!,
          participants: form.participants!,
          categories: form.categories!,
          language: form.language!,
          type: form.type!,
          meetingPoint: form.meetingPoint!,
          status: form.status!,
        };

        const updated = await TourService.update(item.id, dto);

        setItem(updated);
        setIsEditing(false);

        toast.success("Tour updated successfully!");
      }
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const isRemoved = shopStatus === "REMOVED";
  const showEditing = !isRemoved && isEditing;

  if (access === false) {
    return <Unauthorized />;
  }

  if (isNew && isRemoved) {
    return (
      <div className="bg-base-100 min-h-screen p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Cannot add tours</h1>
          <p className="text-gray-600 mb-6">
            This shop has been removed and no new tours can be created.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push(`/shops/manager?shopId=${shopId}`)}
          >
            Back to shop manager
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!isNew && !item) {
    return <div className="text-center mt-10 text-lg">Item not found</div>;
  }

  return (
    <div className="bg-base-100 min-h-screen p-6">
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {isNew
              ? "Add Tour"
              : isRemoved
                ? "Tour Details"
                : isEditing
                  ? "Edit Tour"
                  : "Tour Details"}
          </h1>
          {isRemoved && !isNew && (
            <span className="badge badge-warning mt-2">Read-only shop</span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Back button */}
          <button
            onClick={() => router.push(`/shops/manager?shopId=${shopId}`)}
            className="btn btn-md btn-outline flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Edit / Cancel */}
          {!isNew && !isRemoved && (
            <button
              className="btn btn-md btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          )}

          {/* Save */}
          {showEditing && (
            <button className="btn btn-md btn-success" onClick={handleSave}>
              Save
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header card */}
        <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
          {isEditing ? (
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-base-content/70">
                  Tour title
                </span>
                <input
                  className="input input-bordered mt-2 w-full text-2xl font-bold sm:text-3xl"
                  value={form.title || ""}
                  placeholder="Title"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-base-content sm:text-3xl">
                    {item?.title}
                  </h1>

                  {item?.status ? (
                    <span
                      className={`badge ${
                        item.status === "ACTIVE"
                          ? "badge-success"
                          : item.status === "ON_HOLD"
                            ? "badge-warning"
                            : "badge-error"
                      }`}
                    >
                      {item.status}
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-base-content/55">
                  Tour ID: <span className="font-medium">{item?.id}</span>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Media + main details */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Tour media */}
          <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-base-content">
                Tour media
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                Manage the images customers see when browsing and booking this
                tour.
              </p>
            </div>

            {isNew ? (
              <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/50 p-6 text-sm text-base-content/65">
                <p className="font-medium text-base-content">
                  Images unavailable
                </p>
                <p className="mt-1">
                  Add images after the tour has been created.
                </p>
              </div>
            ) : (
              <TourImagesManager
                tourId={Number(itemId)}
                isEditing={!isRemoved && isEditing}
                tourImages={tourImages}
                setTourImages={setTourImages}
              />
            )}
          </div>

          {/* Core details */}
          <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-base-content">
                Core details
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                Define the main customer-facing information for this tour.
              </p>
            </div>

            <div className="space-y-5">
              {/* Description */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  Description
                </p>

                {isEditing ? (
                  <div className="mt-2">
                    <textarea
                      className={`textarea textarea-bordered min-h-32 w-full ${
                        errors.description ? "textarea-error" : ""
                      }`}
                      placeholder="Description (min 10 characters)"
                      value={form.description || ""}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                    {errors.description ? (
                      <p className="mt-1 text-sm text-error">
                        {errors.description}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 leading-7 text-base-content/75">
                    {item?.description || "No description set"}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  Status
                </p>

                {isEditing || isNew ? (
                  <select
                    className="select select-bordered mt-2 w-full sm:max-w-xs"
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
                    className={`badge mt-2 ${
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
            </div>
          </div>
        </section>

        {/* Pricing and logistics */}
        <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-base-content">
              Pricing & logistics
            </h2>
            <p className="mt-1 text-sm text-base-content/60">
              Configure price, format, duration, capacity, and meeting details.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Price */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Price
              </p>

              {isEditing ? (
                <div className="mt-2">
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
                  {errors.price ? (
                    <p className="mt-1 text-sm text-error">{errors.price}</p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-base font-medium text-base-content">
                  €{item?.price}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Type
              </p>

              {isEditing ? (
                <select
                  className="select select-bordered mt-2 w-full"
                  value={form.type || TYPE_OPTIONS[0]}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-2 font-medium text-base-content">
                  {item?.type || "-"}
                </p>
              )}
            </div>

            {/* Intensity */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Intensity
              </p>

              {isEditing ? (
                <select
                  className="select select-bordered mt-2 w-full"
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
                <p className="mt-2 font-medium text-base-content">
                  {item?.intensity || "-"}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Duration
              </p>

              {isEditing ? (
                <select
                  className="select select-bordered mt-2 w-full"
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
                <p className="mt-2 font-medium text-base-content">
                  {formatDuration(item?.timeRequired)}
                </p>
              )}
            </div>

            {/* Participants */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Max participants
              </p>

              {isEditing ? (
                <div className="mt-2">
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
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  {errors.participants ? (
                    <p className="mt-1 text-sm text-error">
                      {errors.participants}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 font-medium text-base-content">
                  {item?.participants || "-"}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* Location */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Location
              </p>

              {isEditing ? (
                <div className="mt-2">
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
                  {errors.location ? (
                    <p className="mt-1 text-sm text-error">{errors.location}</p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 font-medium text-base-content">
                  {item?.location || (
                    <span className="text-base-content/45">
                      No location set
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Meeting point */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Meeting point
              </p>

              {isEditing ? (
                <div className="mt-2">
                  <input
                    className={`input input-bordered w-full ${
                      errors.meetingPoint ? "input-error" : ""
                    }`}
                    placeholder="Meeting point (required)"
                    value={form.meetingPoint || ""}
                    onChange={(e) =>
                      setForm({ ...form, meetingPoint: e.target.value })
                    }
                  />
                  {errors.meetingPoint ? (
                    <p className="mt-1 text-sm text-error">
                      {errors.meetingPoint}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 font-medium text-base-content">
                  {item?.meetingPoint || (
                    <span className="text-base-content/45">
                      No meeting point set
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Languages and categories */}
        <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-base-content">
              Languages & categories
            </h2>
            <p className="mt-1 text-sm text-base-content/60">
              Help customers understand the tour format and discover it through
              browsing filters.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Languages */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Languages
              </p>

              {isEditing ? (
                <div className="mt-2">
                  <EditableLanguages
                    value={Array.isArray(form.language) ? form.language : []}
                    onChange={(langs) => setForm({ ...form, language: langs })}
                    isEditing={isEditing}
                  />
                </div>
              ) : (
                <p className="mt-2 font-medium text-base-content">
                  {item?.language?.length ? item.language.join(", ") : "-"}
                </p>
              )}

              {errors.language ? (
                <p className="mt-1 text-sm text-error">{errors.language}</p>
              ) : null}
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Categories
              </p>

              {isEditing ? (
                <div className="mt-2">
                  <CategorySelector
                    selected={form.categories ?? []}
                    onChange={(newList: TourCategory[]) =>
                      setForm((prev) => ({
                        ...prev,
                        categories: newList,
                      }))
                    }
                  />
                </div>
              ) : item?.categories?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full border border-base-300 bg-base-200/60 px-3 py-1 text-sm text-base-content"
                    >
                      {cat.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-base-content/45">No categories set</p>
              )}
            </div>
          </div>
        </section>

        {/* Schedules */}
        {item ? (
          <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-base-content">
                Schedules
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                Manage when this tour can be booked and how availability is
                exposed to customers.
              </p>
            </div>

            <EditableSchedules
              tourId={item.id}
              isEditing={!isRemoved && isEditing}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
