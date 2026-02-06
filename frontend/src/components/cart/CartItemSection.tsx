"use client";

import React from "react";
import CartItem from "./CartItem";
import { useDispatch } from "react-redux";
import { removeItemFromCart, toggleItemSelection } from "@/store/cartSlice";
import { CartItem as CartItemType } from "@/types";

interface Props {
  cart: CartItemType[];
  onView?: (item: CartItemType) => void;
}

const CartItemSection: React.FC<Props> = ({ cart, onView }) => {
  const dispatch = useDispatch();

  const handleRemove = (cartItemId: string) => {
    dispatch(removeItemFromCart(cartItemId));
  };

  const handleToggle = (cartItemId: string) => {
    dispatch(toggleItemSelection(cartItemId));
  };

  // ✅ Count selected items
  const selectedCount = cart.filter((item) => item.selected).length;

  // ✅ Check if all are selected
  const allSelected = cart.length > 0 && selectedCount === cart.length;

  // ✅ Toggle all
  const handleToggleAll = () => {
    cart.forEach((item) => {
      if (item.selected !== !allSelected) {
        dispatch(toggleItemSelection(item.cartItemId));
      }
    });
  };

  const handleRemoveSelected = () => {
    const selectedItems = cart.filter((item) => item.selected);

    selectedItems.forEach((item) => {
      dispatch(removeItemFromCart(item.cartItemId));
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
          {/* ✅ Select All + Remove Selected */}
          <div className="flex items-center justify-between border-b pb-2 mb-4 mt-2 ml-1">
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

            <button
              onClick={handleRemoveSelected}
              disabled={selectedCount === 0}
              className="btn btn-sm btn-outline btn-error disabled:opacity-50"
            >
              Remove ({selectedCount})
            </button>
          </div>

          {/* ✅ Cart Items */}
          {cart.map((entry, index) => (
            <CartItem
              key={entry.cartItemId || `${entry.id}-${index}`} // ✅ fallback if missing
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
