"use client";

import { CalendarDays, Eye, Trash2, Users } from "lucide-react";

import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onView: (item: CartItemType) => void;
  onToggle: (id: string) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

const formatPrice = (price: number) => currencyFormatter.format(price);

export default function CartItem({
  item,
  onRemove,
  onView,
  onToggle,
}: CartItemProps) {
  const isPublic = item.type === "PUBLIC";
  const totalPrice = isPublic ? item.price * item.participants : item.price;
  const imageUrl = item.images?.[0] || "/images/item_placeholder.jpg";
  const usesPlaceholder = !item.images?.length;

  return (
    <article
      className={`rounded-[24px] border bg-base-100 p-4 shadow-sm transition sm:p-5 ${
        item.selected
          ? "border-primary/25 shadow-[0_14px_40px_rgba(2,132,199,0.08)]"
          : "border-base-300"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <label
            htmlFor={`cart-item-${item.cartItemId}`}
            className="flex cursor-pointer items-start pt-1"
          >
            <input
              id={`cart-item-${item.cartItemId}`}
              type="checkbox"
              checked={item.selected}
              onChange={() => onToggle(item.cartItemId)}
              className="checkbox checkbox-primary"
              aria-label={`Select ${item.title}`}
            />
          </label>

          <button
            type="button"
            onClick={() => onView(item)}
            className="shrink-0"
            aria-label={`View ${item.title}`}
          >
            <img
              src={imageUrl}
              alt={item.title}
              className={`aspect-[4/3] w-24 rounded-2xl object-cover sm:w-32 ${
                usesPlaceholder ? "opacity-70 grayscale blur-[1px]" : ""
              }`}
              onError={(event) => {
                event.currentTarget.src = "/images/item_placeholder.jpg";
                event.currentTarget.classList.add(
                  "opacity-70",
                  "grayscale",
                  "blur-[1px]",
                );
              }}
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onView(item)}
                  className="block text-left text-lg font-semibold text-base-content transition hover:text-primary"
                >
                  {item.title}
                </button>
                <p className="mt-1 text-sm text-base-content/65">
                  {formatPrice(item.price)}{" "}
                  {isPublic ? "per participant" : "per tour"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`badge border px-3 py-3 ${
                      item.selected
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-base-300 bg-base-100 text-base-content/65"
                    }`}
                  >
                    {item.selected ? "Selected" : "Not selected"}
                  </span>
                  <span className="badge border border-base-300 bg-base-100 px-3 py-3 text-base-content/70">
                    {item.type}
                  </span>
                  {item.preferredLanguage ? (
                    <span className="badge border border-base-300 bg-base-100 px-3 py-3 text-base-content/70">
                      {item.preferredLanguage}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-base-content/75">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-base-300 bg-base-200/45 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>
                  {item.selectedDate} at {item.selectedTime}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-base-300 bg-base-200/45 px-3 py-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  {item.participants} participant
                  {item.participants === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {item.comment ? (
              <div className="mt-4 rounded-2xl border border-base-300 bg-base-200/35 px-4 py-3 text-sm leading-6 text-base-content/70">
                {item.comment}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:w-60 lg:items-end">
          <div className="flex flex-wrap items-center justify-between gap-3 lg:w-full">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onView(item)}
            >
              <Eye className="h-4 w-4" />
              View
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm text-error"
              onClick={() => onRemove(item.cartItemId)}
              aria-label={`Remove ${item.title} from cart`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-right lg:w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
              Line Total
            </p>
            <p className="mt-1 text-lg font-semibold text-base-content">
              {formatPrice(totalPrice)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
