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

  // ✅ Count selected items
  const selectedCount = cart.filter((item) => item.selected).length;

  // ✅ Check if all are selected
  const allSelected = cart.length > 0 && selectedCount === cart.length;

  // ✅ Toggle all
  const handleToggleAll = () => {
    cart.forEach((item) => {
      if (item.selected !== !allSelected) {
        dispatch(toggleItemSelection(item.id));
      }
    });
  };

  return (
    <div className="w-full md:w-2/3 lg:w-2/3 space-y-4">
      <h2 className="text-2xl font-bold mb-5">Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      ) : (
        <>
          {/* ✅ Select All Checkbox */}
          <div className="flex items-center gap-3 border-b pb-2 mb-4 mt-2 ml-1">
            <label
              htmlFor="cart-toggle-all"
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                id="cart-toggle-all"
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="checkbox"
              />
              <span className="text-sm text-gray-700 ml-2">
                Select all ({selectedCount})
              </span>
            </label>
          </div>

          {/* ✅ Cart Items */}
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
