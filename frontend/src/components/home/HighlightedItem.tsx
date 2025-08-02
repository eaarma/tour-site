"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Item } from "@/types";

interface HighlightedItemProps {
  items: Item[];
}

const HighlightedItem: React.FC<HighlightedItemProps> = ({ items }) => {
  const [highlighted, setHighlighted] = useState<Item | null>(null);

  useEffect(() => {
    const pickRandomTour = () => {
      const randomIndex = Math.floor(Math.random() * items.length);
      setHighlighted(items[randomIndex]);
    };

    pickRandomTour(); // Initial pick
    const interval = setInterval(pickRandomTour, 30000); // Every 30s

    return () => clearInterval(interval);
  }, [items]);

  if (!highlighted) return null;

  return (
    <div className="card lg:card-side bg-base-100 shadow-xl border overflow-hidden">
      <figure className="w-full lg:w-1/2 h-64 lg:h-auto">
        <Image
          src={highlighted.image}
          alt={highlighted.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </figure>

      <div className="card-body p-6 flex flex-col justify-between">
        <div>
          <h2 className="card-title text-2xl font-bold mb-2">
            {highlighted.title}
          </h2>
          <p className="text-gray-600 mb-4">{highlighted.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <strong>Time:</strong> {highlighted.timeRequired}
            </p>
            <p>
              <strong>Price:</strong> {highlighted.price}
            </p>
            <p>
              <strong>Intensity:</strong> {highlighted.intensity}
            </p>
            <p>
              <strong>Participants:</strong> {highlighted.participants}
            </p>
            <p>
              <strong>Category:</strong> {highlighted.category}
            </p>
            <p>
              <strong>Language:</strong> {highlighted.language}
            </p>
            <p>
              <strong>Location:</strong> {highlighted.location}
            </p>
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <Link href={`/items/${highlighted.id}`} className="btn btn-primary">
            View Tour
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HighlightedItem;
