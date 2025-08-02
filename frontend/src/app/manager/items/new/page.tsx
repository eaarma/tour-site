"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types/types";

type EditAddItemPageProps = {
  mode: "add" | "edit";
  initialData?: Item;
};

export default function EditAddItemPage({
  mode,
  initialData,
}: EditAddItemPageProps) {
  const router = useRouter();

  const [images, setImages] = useState<(File | string)[]>([]);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [price, setPrice] = useState(initialData?.price || "");
  const [timeRequired, setTimeRequired] = useState(
    initialData?.timeRequired || ""
  );
  const [participants, setParticipants] = useState(
    initialData?.participants || ""
  );
  const [intensity, setIntensity] = useState(initialData?.intensity || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [language, setLanguage] = useState(initialData?.language || "");
  const [location, setLocation] = useState(initialData?.location || "");

  const moveImageLeft = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];
    setImages(newImages);
  };

  const moveImageRight = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index + 1], newImages[index]] = [
      newImages[index],
      newImages[index + 1],
    ];
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const item: Item = {
      id: initialData?.id || Date.now().toString(),
      image,
      title,
      description,
      price,
      timeRequired,
      participants,
      intensity,
      category,
      language,
      location,
    };

    if (mode === "add") {
      console.log("Adding item:", item);
    } else {
      console.log("Updating item:", item);
    }

    // For now, just go back
    router.back();
  };

  return (
    <main className="bg-base-200 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {mode === "add" ? "Add Item" : "Edit Item"}
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Image input (basic URL for now, could be replaced with file picker) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Images (first = cover)
            </label>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded overflow-hidden shadow"
                >
                  {/* Image */}
                  <img
                    src={
                      typeof img === "string" ? img : URL.createObjectURL(img)
                    }
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Reorder arrows: on bottom of image */}
                  <div className="absolute bottom-0 left-0 w-full text-white flex justify-center gap-2 py-1">
                    <button
                      type="button"
                      className="btn btn-xs btn-circle  text-white"
                      onClick={() => moveImageLeft(index)}
                      disabled={index === 0}
                      title="Move left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-circle text-white"
                      onClick={() => moveImageRight(index)}
                      disabled={index === images.length - 1}
                      title="Move right"
                    >
                      →
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    className="btn btn-xs btn-error absolute top-1 right-1 btn-circle"
                    onClick={() => removeImage(index)}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <label className="btn btn-outline btn-sm">
              Choose Images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setImages((prev) => [
                      ...prev,
                      ...Array.from(e.target.files),
                    ]);
                  }
                }}
              />
            </label>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">Time Required</label>
              <input
                type="text"
                value={timeRequired}
                onChange={(e) => setTimeRequired(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">Participants</label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">Intensity</label>
              <input
                type="text"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="label">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-4">
            {mode === "add" ? "Add Item" : "Save Item"}
          </button>
        </form>
      </div>
    </main>
  );
}
