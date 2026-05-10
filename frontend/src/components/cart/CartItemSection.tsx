"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useDispatch } from "react-redux";

import CartItem from "./CartItem";
import { removeItemFromCart, toggleItemSelection } from "@/store/cartSlice";
import type { CartItem as CartItemType } from "@/types";

interface Props {
  cart: CartItemType[];
  onView?: (item: CartItemType) => void;
}

export default function CartItemSection({ cart, onView }: Props) {
  const dispatch = useDispatch();

  const handleRemove = (cartItemId: string) => {
    dispatch(removeItemFromCart(cartItemId));
  };

  const handleToggle = (cartItemId: string) => {
    dispatch(toggleItemSelection(cartItemId));
  };

  const selectedCount = cart.filter((item) => item.selected).length;
  const allSelected = cart.length > 0 && selectedCount === cart.length;

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
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">
          1
        </span>
        <div>
          <h2 className="text-lg font-semibold text-base-content">
            Cart Items
          </h2>
          <p className="text-sm text-base-content/60">
            Review the tours you want to keep in this checkout flow.
          </p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-base-200 text-base-content/70">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-base-content">
            Your cart is empty
          </h3>
          <p className="mt-2 text-sm leading-6 text-base-content/60">
            Add a few tours first, then come back here to review your booking
            details.
          </p>
          <div className="mt-6">
            <Link href="/items" className="btn btn-primary h-12 px-6 text-base">
              Continue Browsing
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[24px] border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label
                  htmlFor="cart-toggle-all"
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    id="cart-toggle-all"
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleToggleAll}
                    className="checkbox checkbox-primary"
                  />
                  <span className="text-sm font-medium text-base-content/80">
                    Select all items
                  </span>
                </label>
                <p className="mt-2 text-sm text-base-content/60">
                  {selectedCount} of {cart.length} line items selected for
                  checkout.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-error h-11 px-4"
                disabled={selectedCount === 0}
                onClick={handleRemoveSelected}
              >
                Remove Selected
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {cart.map((entry, index) => (
              <CartItem
                key={entry.cartItemId || `${entry.id}-${index}`}
                item={entry}
                onRemove={handleRemove}
                onView={onView ?? (() => undefined)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
