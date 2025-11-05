"use client";

import React from "react";
import { X } from "lucide-react";
import { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onView: (item: CartItemType) => void;
  onToggle: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  onView,
  onToggle,
}) => {
  const totalPrice = item.price * item.participants;

  // ✅ Thumbnail logic (support new images array or fallback to single image field)
  const thumbnail =
    (item as any).images?.[0] || (item as any).image || "/images/default.jpg";

  return (
    <div className="w-full flex items-center gap-3 py-2">
      {/* Selection Checkbox */}
      <input
        id={`cart-toggle-${item.cartItemId}`}
        type="checkbox"
        checked={item.selected}
        onChange={() => onToggle(item.cartItemId)}
        className="checkbox ml-1"
      />

      {/* Main Card Content */}
      <div className="flex flex-col w-full md:flex-row justify-between items-start md:items-center border rounded-xl p-4 shadow-sm bg-base-100 hover:shadow-md transition-shadow">
        {/* Tour Details */}

        {/* ✅ Thumbnail Image */}
        <img
          src={thumbnail}
          alt={item.title}
          className="w-16 h-16 mr-3 object-cover rounded-lg cursor-pointer"
          onClick={() => onView(item)}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
            <span className="bg-gray-100 rounded-full px-2 py-1">
              {item.participants} participant{item.participants > 1 ? "s" : ""}
            </span>
            <span className="bg-gray-100 rounded-full px-2 py-1">
              €{item.price} each
            </span>
            <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1">
              {item.selectedDate} @ {item.selectedTime}
            </span>
          </div>
        </div>

        {/* Actions + Price */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            className="btn btn-sm"
            onClick={() => onView(item)}
            aria-label={`View ${item.title}`}
          >
            View
          </button>

          <button
            onClick={() => onRemove(item.cartItemId)}
            className="btn btn-sm btn-error btn-outline"
            aria-label={`Delete ${item.title}`}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="ml-4 text-right font-semibold text-primary">
            €{totalPrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
