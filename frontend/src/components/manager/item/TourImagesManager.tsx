"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TourImage } from "@/types";
import { tourImageService } from "@/lib/tourImageService";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import toast from "react-hot-toast";

interface Props {
  tourId: number;
  isEditing: boolean;
  tourImages: TourImage[];
  setTourImages: React.Dispatch<React.SetStateAction<TourImage[]>>;
}

export default function TourImagesManager({
  tourId,
  isEditing,
  tourImages,
  setTourImages,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const PLACEHOLDER = "/images/item_placeholder.jpg";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Upload image
  const handleTourImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileRef = ref(storage, `tours/${tourId}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) =>
          setUploadProgress(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          ),
        () => {
          toast.error("Upload failed");
          setUploading(false);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const saved = await tourImageService.addImage(tourId, imageUrl);
          setTourImages((prev) => [...prev, saved]);
          toast.success("Image uploaded");
          setUploading(false);
        }
      );
    } catch {
      toast.error("Upload error");
      setUploading(false);
    }
  };

  function getStoragePathFromUrl(url: string) {
    // everything after `/o/` before `?`
    const decoded = decodeURIComponent(url);
    const path = decoded.split("/o/")[1].split("?")[0];
    return path;
  }

  async function deleteFromStorageByUrl(imageUrl: string) {
    const path = getStoragePathFromUrl(imageUrl);
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  }

  // Delete image
  const handleDeleteImage = async (id: number, imageUrl: string) => {
    try {
      await deleteFromStorageByUrl(imageUrl);
      await tourImageService.deleteImage(tourId, id); // 👈 add tourId
      setTourImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Image deleted");
    } catch (e) {
      toast.error("Failed to delete image");
    }
  };

  async function deleteFromFirebase(imageUrl: string) {
    const fileRef = ref(storage, imageUrl);
    await deleteObject(fileRef);
  }

  // Drag reorder save
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tourImages.findIndex((img) => img.id === active.id);
    const newIndex = tourImages.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(tourImages, oldIndex, newIndex);

    setTourImages(reordered);
    await tourImageService.updateOrder(
      tourId,
      reordered.map((img) => img.id)
    );
  };

  // Sortable tile
  const ImageTile = ({ img, index }: { img: TourImage; index: number }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: img.id });

    const [failed, setFailed] = useState(false);

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const displaySrc = failed || !img.imageUrl ? PLACEHOLDER : img.imageUrl;

    return (
      <div
        ref={setNodeRef}
        style={isEditing ? style : undefined}
        className="relative rounded-lg overflow-hidden group"
        {...(isEditing ? { ...attributes, ...listeners } : {})}
      >
        <img
          src={displaySrc}
          onError={() => setFailed(true)}
          className={`h-40 w-full object-cover rounded-lg transition-all ${
            failed ? "opacity-70 grayscale blur-[1px]" : ""
          }`}
        />

        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
          #{index + 1}
        </div>

        {isEditing && (
          <button
            className="absolute top-1 right-1 btn btn-xs btn-error opacity-0 group-hover:opacity-100 transition"
            onClick={() => handleDeleteImage(img.id, img.imageUrl)}
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Button */}
      {isEditing && (
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            className="hidden"
            onChange={handleTourImageUpload}
          />
          <button
            onClick={() => document.getElementById("imageUpload")?.click()}
            className="btn btn-sm btn-outline"
          >
            + Add Image
          </button>
          {uploading && (
            <progress
              className="progress progress-primary w-full"
              value={uploadProgress}
              max="100"
            />
          )}
        </div>
      )}

      {/* ⛔ If NO images → show a placeholder tile */}
      {tourImages.length === 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg overflow-hidden">
            <img
              src={PLACEHOLDER}
              className="h-40 w-full object-cover opacity-70 grayscale blur-[1px] rounded-lg"
            />
          </div>
        </div>
      )}

      {/* If images exist → show grid */}
      {tourImages.length > 0 && (
        <>
          {isEditing ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tourImages.map((img) => img.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-3">
                  {tourImages.map((img, index) => (
                    <ImageTile key={img.id} img={img} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {tourImages.map((img, index) => (
                <ImageTile key={img.id} img={img} index={index} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
