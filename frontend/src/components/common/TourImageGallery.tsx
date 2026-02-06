"use client";

import { useRef, useState } from "react";

interface TourImageGalleryProps {
  images?: string[];
  title?: string;
}

export default function TourImageGallery({
  images = [],
  title,
}: TourImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const placeholder = "/images/item_placeholder.jpg";

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  // If no images → use placeholder
  const mainImage = images.length > 0 ? images[selectedIndex] : placeholder;
  const isPlaceholder = images.length === 0;

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* ✅ Main Image */}
      <div className="w-full">
        <img
          src={mainImage}
          alt={title || "Tour Image"}
          className={`rounded-xl w-full h-72 lg:h-[420px] object-cover shadow-md ${
            isPlaceholder ? "opacity-70 grayscale " : ""
          }`}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.src = placeholder;
            img.classList.add("opacity-70", "grayscale", "blur-[1px]");
          }}
        />
      </div>

      {/* ✅ Thumbnails */}
      {images.length > 1 && (
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="flex gap-3 overflow-x-auto pb-2 cursor-grab w-full max-w-full active:cursor-grabbing select-none"
        >
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="h-20 w-28 object-cover pointer-events-none"
                onError={(e) => {
                  const thumb = e.currentTarget as HTMLImageElement;
                  thumb.src = placeholder;
                  thumb.classList.add("opacity-70", "grayscale", "blur-[1px]");
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
