import React from "react";
import { Item } from "@/types/types";
import CartItem from "./CartItem";

interface CartItemSectionProps {
  cart: { item: Item; quantity: number }[];
  onRemove: (id: string) => void;
}

const CartItemSection: React.FC<CartItemSectionProps> = ({
  cart,
  onRemove,
}) => {
  const totalPrice = cart.reduce(
    (acc, entry) => acc + parseFloat(entry.item.price) * entry.quantity,
    0
  );

  return (
    <div className="w-full md:w-2/3 space-y-4 p-4">
      <h2 className="text-xl font-bold mb-2">Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          {cart.map(({ item, quantity }) => (
            <CartItem
              key={item.id}
              item={item}
              quantity={quantity}
              onRemove={() => onRemove(item.id)}
            />
          ))}
          <div className="text-right font-bold text-lg mt-4">
            Total: €{totalPrice.toFixed(2)}
          </div>
        </>
      )}
    </div>
  );
};

export default CartItemSection;
