"use client";

import { useState } from "react";
import { ShopDto } from "@/types/shop";

type ShopStatus = "ACTIVE" | "DISABLED" | "REMOVED";

type AdminShopStatusModalProps = {
  shop: ShopDto;
  setting: boolean;
  onClose: () => void;
  onConfirm: (payload: { status: ShopStatus; statusReason?: string }) => void;
};

const STATUS_OPTIONS: Array<{
  value: ShopStatus;
  label: string;
  description: string;
}> = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Shop is visible and can operate normally.",
  },
  {
    value: "DISABLED",
    label: "Disabled",
    description: "Shop is temporarily blocked but not removed.",
  },
  {
    value: "REMOVED",
    label: "Removed",
    description: "Shop is soft-removed and hidden from normal usage.",
  },
];

export default function AdminShopStatusModal({
  shop,
  setting,
  onClose,
  onConfirm,
}: AdminShopStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ShopStatus>(
    shop.status as ShopStatus,
  );
  const [statusReason, setStatusReason] = useState(shop.statusReason ?? "");

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="text-lg font-semibold">Set shop status</h3>

        <p className="mt-2 text-sm text-base-content/70">
          Update the status for{" "}
          <span className="font-medium text-base-content">{shop.name}</span>.
        </p>

        <div className="mt-5 space-y-3">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selectedStatus === option.value
                  ? "border-primary bg-primary/10"
                  : "border-base-300 bg-base-100 hover:border-primary/40"
              }`}
              onClick={() => setSelectedStatus(option.value)}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{option.label}</span>

                {selectedStatus === option.value ? (
                  <span className="badge badge-primary badge-outline">
                    Selected
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm text-base-content/65">
                {option.description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="label">
            <span className="label-text font-medium">Status reason</span>
          </label>

          <textarea
            className="textarea textarea-bordered min-h-28 w-full"
            maxLength={1000}
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder="Explain why this shop status is being changed..."
            disabled={setting}
          />

          <div className="mt-1 text-right text-xs text-base-content/50">
            {statusReason.length}/1000
          </div>
        </div>

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={setting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={setting || selectedStatus === shop.status}
            onClick={() =>
              onConfirm({
                status: selectedStatus,
                statusReason: statusReason.trim() || undefined,
              })
            }
          >
            {setting ? "Saving..." : "Save status"}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="modal-backdrop"
        onClick={setting ? undefined : onClose}
        aria-label="Close status modal"
      />
    </div>
  );
}
