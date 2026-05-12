"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flame,
  Globe,
  MapPin,
  PinIcon,
  Tag,
  Users,
} from "lucide-react";

import Badge from "@/components/common/Badge";
import TourImageGallery from "@/components/common/TourImageGallery";
import BookingModal from "@/components/items/BookingModal";
import SchedulePicker from "@/components/items/SchedulePicker";
import type { ItemPageServerData } from "@/lib/items/getItemPageServerData";
import type { TourScheduleResponseDto } from "@/types/tourSchedule";
import { formatDuration } from "@/utils/formatDuration";

type Props = {
  initialData: ItemPageServerData;
};

function formatCategory(cat: string) {
  return cat
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getIntensityColor(intensity: string) {
  const level = intensity?.toLowerCase();

  if (level === "easy" || level === "low") {
    return "border-success/25 bg-success/10 text-success";
  }

  if (level === "moderate" || level === "medium") {
    return "border-warning/30 bg-warning/10 text-warning";
  }

  if (level === "hard" || level === "high" || level === "extreme") {
    return "border-error/30 bg-error/10 text-error";
  }

  return "border-base-300 bg-base-200 text-base-content/70";
}

const statusDot: Record<string, string> = {
  ACTIVE: "bg-success",
  ON_HOLD: "bg-warning",
  "ON HOLD": "bg-warning",
  CANCELLED: "bg-error",
};

const statusPill: Record<string, string> = {
  ACTIVE: "border-success/25 bg-success/10 text-success",
  ON_HOLD: "border-warning/30 bg-warning/10 text-warning",
  "ON HOLD": "border-warning/30 bg-warning/10 text-warning",
  CANCELLED: "border-error/30 bg-error/10 text-error",
};

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100/70 p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg text-base-content/60">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-[11px] leading-none text-base-content/50">
          {label}
        </p>
        <div className="truncate text-sm font-medium text-card-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function ItemPageClient({ initialData }: Props) {
  const router = useRouter();

  const { item, schedules } = initialData;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<TourScheduleResponseDto | null>(null);

  const statusLabel = item.status?.replace(/_/g, " ") || "ACTIVE";
  const statusDotClass =
    statusDot[item.status] || statusDot[statusLabel] || "bg-success";
  const statusPillClass =
    statusPill[item.status] ||
    statusPill[statusLabel] ||
    "border-success/25 bg-success/10 text-success";

  const priceUnit = item.type === "PUBLIC" ? "/person" : "/tour";

  return (
    <div className="min-h-screen bg-base-100 py-6 md:px-6">
      <div className="mx-auto mb-4 max-w-5xl">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/items");
          }}
          className="btn btn-md btn-outline flex items-center gap-1 rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col lg:flex-row">
            <div className="relative m-4 shrink-0 sm:m-6 lg:mr-0 lg:w-1/2">
              <TourImageGallery images={item.images} title={item.title} />

              {item.status ? (
                <div
                  className={[
                    "absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm",
                    statusPillClass,
                  ].join(" ")}
                >
                  <span
                    className={["size-1.5 rounded-full", statusDotClass].join(
                      " ",
                    )}
                  />
                  {statusLabel}
                </div>
              ) : null}

              {item.type ? (
                <Badge className="absolute left-4 top-4 z-10 border border-base-300 bg-base-100/90 text-xs text-card-foreground shadow-sm backdrop-blur-sm">
                  {item.type}
                </Badge>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-5 p-6 lg:p-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-balance text-2xl font-bold leading-tight text-card-foreground sm:text-3xl">
                  {item.title}
                </h1>

                {item.location ? (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                ) : null}

                {item.meetingPoint ? (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <PinIcon className="size-4 shrink-0" />
                    <span className="truncate first-letter:capitalize">
                      {item.meetingPoint}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="ml-1 text-3xl font-bold text-card-foreground">
                  €{item.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {priceUnit}
                </span>
              </div>

              <div className="h-px bg-base-300" />

              {item.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatTile
                  icon={<Clock className="size-5" />}
                  label="Duration"
                  value={formatDuration(item.timeRequired)}
                />

                <StatTile
                  icon={<Users className="size-5" />}
                  label="Group size"
                  value={`Up to ${item.participants}`}
                />

                <StatTile
                  icon={<Flame className="size-5" />}
                  label="Pace"
                  value={
                    <Badge
                      variant="outline"
                      className={[
                        "px-2 py-0 text-[11px] font-medium",
                        getIntensityColor(item.intensity),
                      ].join(" ")}
                    >
                      {item.intensity}
                    </Badge>
                  }
                />

                <StatTile
                  icon={<Globe className="size-5" />}
                  label="Language"
                  value={
                    Array.isArray(item.language) && item.language.length > 0
                      ? item.language.join(", ")
                      : "-"
                  }
                />
              </div>

              {item.categories?.length ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Tag className="size-3.5 shrink-0" />
                    Categories
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="px-2.5 py-0.5 text-xs text-primary-content"
                      >
                        {formatCategory(cat)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.shopId && item.shopName ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="size-3.5 shrink-0" />
                    Provider
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/publicShops/${item.shopId}`)}
                    className="text-left text-sm font-medium text-primary hover:underline"
                  >
                    {item.shopName}
                  </button>
                </div>
              ) : null}

              <div className="h-px bg-base-300" />

              <SchedulePicker
                schedules={schedules}
                selectedScheduleId={selectedSchedule?.id}
                onSelect={setSelectedSchedule}
                className="mt-1"
              />

              <button
                type="button"
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold",
                  "w-full lg:w-auto",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100",
                  !selectedSchedule
                    ? "cursor-not-allowed border border-base-300 bg-base-200 text-muted-foreground"
                    : [
                        "border border-primary/60 bg-primary text-primary-content shadow-md shadow-black/10",
                        "hover:-translate-y-[1px] hover:bg-primary/90 hover:shadow-lg hover:shadow-black/15",
                        "active:translate-y-0 active:scale-[0.99] active:bg-primary/80 active:shadow-sm",
                      ].join(" "),
                ].join(" ")}
                onClick={() => setIsModalOpen(true)}
                disabled={!selectedSchedule}
                title={!selectedSchedule ? "Pick a time first" : "Book now"}
              >
                Book Now
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
        selectedSchedule={selectedSchedule ?? undefined}
        schedules={schedules}
      />
    </div>
  );
}
