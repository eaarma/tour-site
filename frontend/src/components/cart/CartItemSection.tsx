"use client";

import React from "react";
import CartItem from "./CartItem";
import { useDispatch } from "react-redux";
import { removeItemFromCart, toggleItemSelection } from "@/store/cartSlice";
import { CartItem as CartItemType } from "@/store/cartSlice";

interface Props {
  cart: CartItemType[];
  onView?: (item: CartItemType) => void;
}

const CartItemSection: React.FC<Props> = ({ cart, onView }) => {
  const dispatch = useDispatch();

  const handleRemove = (id: string) => {
    dispatch(removeItemFromCart(id));
  };

  const handleToggle = (id: string) => {
    dispatch(toggleItemSelection(id));
  };

  return (
    <div className="w-full md:w-2/3 space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      ) : (
        <>
          {cart.map((entry) => (
            <CartItem
              key={entry.id}
              item={entry}
              onRemove={handleRemove}
              onView={onView ? onView : () => {}}
              onToggle={handleToggle}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default CartItemSection;
