"use client";

import { Dispatch, SetStateAction } from "react";

import Modal from "@/components/common/Modal";
import { Tour } from "@/types";

const TOUR_STATUS_OPTIONS = ["ACTIVE", "ON_HOLD", "CANCELLED"] as const;
type TourStatus = (typeof TOUR_STATUS_OPTIONS)[number];

type Props = {
  tour: Tour | null;
  editedStatus: TourStatus;
  setEditedStatus: Dispatch<SetStateAction<TourStatus>>;
  saving: boolean;
  onClose: () => void;
  onSaveStatus: () => void;
};

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-base-content/45">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm font-medium text-base-content ${
          multiline ? "whitespace-pre-line leading-6" : ""
        }`}
      >
        {value || <span className="font-normal text-base-content/45">-</span>}
      </p>
    </div>
  );
}

function formatStatus(status?: string) {
  if (!status) return "-";
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function getStatusBadgeClass(status?: TourStatus | string) {
  if (status === "ACTIVE") return "badge-success";
  if (status === "ON_HOLD") return "badge-warning";
  return "badge-error";
}

function formatCategories(categories?: string[]) {
  if (!categories?.length) return "-";
  return categories.map((category) => category.replace(/_/g, " ")).join(", ");
}

export default function AdminTourModal({
  tour,
  editedStatus,
  setEditedStatus,
  saving,
  onClose,
  onSaveStatus,
}: Props) {
  if (!tour) return null;

  const statusChanged = editedStatus !== tour.status;

  return (
    <Modal isOpen={!!tour} onClose={onClose}>
      <div className="space-y-6">
        <header className="flex flex-col gap-3 border-b border-base-300 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Tour details
            </p>

            <h3 className="mt-1 text-2xl font-bold text-base-content">
              {tour.title}
            </h3>

            <p className="mt-2 text-sm text-base-content/60">
              Tour ID{" "}
              <span className="font-mono text-base-content/75">#{tour.id}</span>
              {tour.shopName || tour.shopId ? (
                <>
                  {" "}
                  · <span>{tour.shopName || `Shop #${tour.shopId}`}</span>
                </>
              ) : null}
            </p>
          </div>

          <span
            className={`badge badge-outline mr-10 ${getStatusBadgeClass(
              tour.status,
            )}`}
          >
            {formatStatus(tour.status)}
          </span>
        </header>

        <section>
          <h4 className="text-sm font-semibold text-base-content">
            Tour information
          </h4>

          <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailRow label="Name" value={tour.title} />
            <DetailRow
              label="Shop"
              value={tour.shopName || `Shop #${tour.shopId}`}
            />
            <DetailRow label="Type" value={formatStatus(tour.type)} />
            <DetailRow
              label="Current status"
              value={formatStatus(tour.status)}
            />

            <div className="border-t border-base-300 pt-5 sm:col-span-2">
              <DetailRow
                label="Description"
                value={tour.description}
                multiline
              />
            </div>
          </div>
        </section>

        <section className="border-t border-base-300 pt-5">
          <h4 className="text-sm font-semibold text-base-content">
            Location & meeting
          </h4>

          <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailRow label="Location" value={tour.location} />
            <DetailRow label="Meeting point" value={tour.meetingPoint} />
          </div>
        </section>

        <section className="border-t border-base-300 pt-5">
          <h4 className="text-sm font-semibold text-base-content">
            Pricing & logistics
          </h4>

          <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailRow label="Price" value={`€${tour.price}`} />
            <DetailRow label="Duration" value={`${tour.timeRequired} min`} />
            <DetailRow label="Participants" value={tour.participants} />
            <DetailRow
              label="Languages"
              value={tour.language?.length ? tour.language.join(", ") : "-"}
            />
          </div>
        </section>

        <section className="border-t border-base-300 pt-5">
          <h4 className="text-sm font-semibold text-base-content">
            Categories
          </h4>

          {tour.categories?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tour.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-base-300 bg-base-200/45 px-3 py-1 text-sm text-base-content"
                >
                  {category.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-base-content/45">
              No categories set.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-base-300 bg-base-200/25 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-base-content">
                Update status
              </label>
              <p className="text-sm text-base-content/60">
                Change whether this tour is available, paused, or cancelled.
              </p>

              <select
                className="select select-bordered mt-2 w-full"
                value={editedStatus}
                onChange={(event) =>
                  setEditedStatus(event.target.value as TourStatus)
                }
              >
                {TOUR_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={saving || !statusChanged}
              onClick={onSaveStatus}
            >
              {saving ? "Saving..." : "Save status"}
            </button>
          </div>
        </section>

        <div className="flex justify-end border-t border-base-300 pt-5">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
