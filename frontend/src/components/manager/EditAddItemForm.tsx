"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TourService } from "@/lib/tourService";
import { TourCreateDto, Item } from "@/types";
import { AuthService } from "@/lib/AuthService";

type Props = {
  mode: "add" | "edit";
  shopId: number;
  itemId?: number | string; // only needed for edit
};

type ValidationErrors = Partial<Record<keyof TourCreateDto, string>>;

const TYPE_OPTIONS = ["Nature", "History", "Culture"];
const STATUS_OPTIONS = ["PENDING", "ACTIVE", "REMOVED"];

export default function EditAddItemForm({ mode, shopId, itemId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<TourCreateDto, "shopId">>({
    image: "",
    title: "",
    description: "",
    price: 0,
    timeRequired: "",
    intensity: "",
    participants: 1,
    category: "",
    language: "",
    type: TYPE_OPTIONS[0],
    location: "",
    status: STATUS_OPTIONS[1],
  });

  // Fetch existing tour data if editing
  useEffect(() => {
    if (mode === "edit" && itemId) {
      let mounted = true;
      (async () => {
        try {
          const data: Item = await TourService.getById(Number(itemId));
          if (mounted) {
            setForm({
              image: data.image || "",
              title: data.title || "",
              description: data.description || "",
              price: data.price || 0,
              timeRequired: data.timeRequired || "",
              intensity: data.intensity || "",
              participants: data.participants || 1,
              category: data.category || "",
              language: data.language || "",
              type: data.type || TYPE_OPTIONS[0],
              location: data.location || "",
              status: data.status || STATUS_OPTIONS[1],
            });
          }
        } catch (err) {
          console.error(err);
          if (mounted) setError("Failed to load tour data");
        } finally {
          if (mounted) setFetching(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }
  }, [mode, itemId, userId]);

  if (fetching) return <div className="p-6">Loading...</div>;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? Number(value) : value,
    }));
  };

  const validate = (): boolean => {
    const errors: ValidationErrors = {};
    if (!form.title) errors.title = "Title is required";
    if (!form.description || form.description.length < 10)
      errors.description = "Description must be at least 10 characters";
    if (!form.image) errors.image = "Image URL is required";
    if (form.price <= 0) errors.price = "Price must be positive";
    if (!form.timeRequired) errors.timeRequired = "Time required";
    if (!form.intensity) errors.intensity = "Intensity required";
    if (form.participants < 1) errors.participants = "At least 1 participant";
    if (!form.category) errors.category = "Category required";
    if (!form.language) errors.language = "Language required";
    if (!form.type) errors.type = "Type required";
    if (!form.location) errors.location = "Location required";
    if (!form.status) errors.status = "Status required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);
    setLoading(true);

    const dto: TourCreateDto = {
      ...form,
      shopId,
    };

    try {
      if (mode === "add") {
        await TourService.create(dto);
      } else if (itemId) {
        await TourService.update(Number(itemId), dto);
      }
      router.push(`/manager`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Failed to save item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Image */}
      <div>
        <label className="label">Main image URL</label>
        <input
          name="image"
          value={form.image}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="https://..."
        />
        {validationErrors.image && (
          <p className="text-red-500">{validationErrors.image}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="label">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        {validationErrors.title && (
          <p className="text-red-500">{validationErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          rows={4}
        />
        {validationErrors.description && (
          <p className="text-red-500">{validationErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="input input-bordered w-full"
            min={0}
          />
          {validationErrors.price && (
            <p className="text-red-500">{validationErrors.price}</p>
          )}
        </div>
        <div>
          <label className="label">Time Required</label>
          <input
            name="timeRequired"
            value={form.timeRequired}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
          {validationErrors.timeRequired && (
            <p className="text-red-500">{validationErrors.timeRequired}</p>
          )}
        </div>
        <div>
          <label className="label">Participants</label>
          <input
            type="number"
            name="participants"
            value={form.participants}
            onChange={handleChange}
            className="input input-bordered w-full"
            min={1}
          />
          {validationErrors.participants && (
            <p className="text-red-500">{validationErrors.participants}</p>
          )}
        </div>
        <div>
          <label className="label">Intensity</label>
          <input
            name="intensity"
            value={form.intensity}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
          {validationErrors.intensity && (
            <p className="text-red-500">{validationErrors.intensity}</p>
          )}
        </div>
        <div>
          <label className="label">Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
          {validationErrors.category && (
            <p className="text-red-500">{validationErrors.category}</p>
          )}
        </div>
        <div>
          <label className="label">Language</label>
          <input
            name="language"
            value={form.language}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
          {validationErrors.language && (
            <p className="text-red-500">{validationErrors.language}</p>
          )}
        </div>

        {/* Type dropdown */}
        <div>
          <label className="label">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {validationErrors.type && (
            <p className="text-red-500">{validationErrors.type}</p>
          )}
        </div>

        {/* Status dropdown */}
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {validationErrors.status && (
            <p className="text-red-500">{validationErrors.status}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="label">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
          {validationErrors.location && (
            <p className="text-red-500">{validationErrors.location}</p>
          )}
        </div>
      </div>

      <button disabled={loading} className="btn btn-primary">
        {loading
          ? "Saving..."
          : mode === "add"
          ? "Create Tour"
          : "Save changes"}
      </button>
    </form>
  );
}
