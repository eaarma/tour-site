"use client";

import { Item } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ItemCardProps {
  item: Item;
  href?: string; // Optional link
  onClick?: () => void; // Optional click handler
}

const ItemCard: React.FC<ItemCardProps> = ({ item, href, onClick }) => {
  const router = useRouter();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/items/${item.id}`);
    }
  };

  const CardContent = (
    <div
      className="card w-full bg-base-100 shadow-md hover:shadow-lg transition duration-300 border cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      <figure>
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      </figure>
      <div className="card-body p-4 flex flex-col">
        <h2 className="card-title text-lg line-clamp-1">{item.title}</h2>
        <div className="text-sm space-y-1 flex-grow">
          <p className="truncate">
            <strong>Time:</strong> {item.timeRequired}
          </p>
          <p className="truncate">
            <strong>Price:</strong> {item.price}
          </p>
          <p className="truncate">
            <strong>Intensity:</strong> {item.intensity}
          </p>
          <p className="truncate">
            <strong>Participants:</strong> {item.participants}
          </p>
          <p className="truncate">
            <strong>Category:</strong> {item.category}
          </p>
          <p className="truncate">
            <strong>Language:</strong> {item.language}
          </p>
          <p className="truncate">
            <strong>Location:</strong> {item.location}
          </p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
};

export default ItemCard;
