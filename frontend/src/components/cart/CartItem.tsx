import React from "react";
import { X } from "lucide-react"; // Or use any icon library you prefer
import { Item } from "@/types/types";

interface CartItemLayoutProps {
  item: Item;
  quantity: number;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemLayoutProps> = ({
  item,
  quantity,
  onRemove,
}) => {
  const totalPrice = parseFloat(item.price) * quantity;

  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded bg-base-100 shadow-sm">
      <div className="flex items-center gap-4">
        <img
          src={item.image}
          alt={item.title}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-gray-500">Qty: {quantity}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-semibold text-primary">
          €{totalPrice.toFixed(2)}
        </span>
        <button onClick={onRemove} className="btn btn-sm btn-error btn-outline">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
