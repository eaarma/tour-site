"use client";

import { Item } from "@/types/types";
import Link from "next/link";

interface ItemCardProps {
  item: Item;
  href?: string; // Optional link
  onClick?: () => void; // Optional click handler
}

const ItemCard: React.FC<ItemCardProps> = ({ item, href, onClick }) => {
  const CardContent = (
    <div
      className="card w-full bg-base-100 shadow-md hover:shadow-lg transition duration-300 border cursor-pointer"
      onClick={onClick}
    >
      <figure>
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-lg">{item.title}</h2>
        <div className="text-sm space-y-1">
          <p>
            <strong>Time:</strong> {item.timeRequired}
          </p>
          <p>
            <strong>Price:</strong> {item.price}
          </p>
          <p>
            <strong>Intensity:</strong> {item.intensity}
          </p>
          <p>
            <strong>Participants:</strong> {item.participants}
          </p>
          <p>
            <strong>Category:</strong> {item.category}
          </p>
          <p>
            <strong>Language:</strong> {item.language}
          </p>
          <p>
            <strong>Location:</strong> {item.location}
          </p>
        </div>
      </div>
    </div>
  );

  // If href is provided, wrap with Link
  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  // Else, render as standalone div with onClick
  return CardContent;
};

export default ItemCard;
