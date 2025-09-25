"use client";

import React from "react";
import { X } from "lucide-react";
import { CartItem as CartItemType } from "@/store/cartSlice";

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

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border rounded-xl p-4 shadow-sm bg-base-100 hover:shadow-md transition-shadow">
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

      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <div className="flex items-center gap-2">
          <input
            id={`cart-toggle-${item.id}`}
            type="checkbox"
            checked={item.selected}
            onChange={() => onToggle(item.id)}
            className="checkbox"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm"
            onClick={() => onView(item)}
            aria-label={`View ${item.title}`}
          >
            View
          </button>

          <button
            onClick={() => onRemove(item.id)}
            className="btn btn-sm btn-error btn-outline"
            aria-label={`Delete ${item.title}`}
            title="Delete"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="ml-4 text-right">
          <div className="font-semibold text-primary">
            €{totalPrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
