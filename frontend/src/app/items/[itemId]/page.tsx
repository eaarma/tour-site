"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tour } from "@/types";
import { TourService } from "@/lib/tourService";
import { TourScheduleService } from "@/lib/tourScheduleService";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import BookingModal from "@/components/items/BookingModal";
import { formatDuration } from "@/utils/formatDuration";
import SchedulePicker from "@/components/items/SchedulePicker";
import TourImageGallery from "@/components/common/TourImageGallery";
import Badge from "@/components/common/Badge";

import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flame,
  Globe,
  MapPin,
  Tag,
  Users,
} from "lucide-react";

function formatCategory(cat: string) {
  return cat
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getIntensityColor(intensity: string) {
  const level = intensity?.toLowerCase();
  if (level === "easy" || level === "low")
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (level === "moderate" || level === "medium")
    return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  if (level === "hard" || level === "high" || level === "extreme")
    return "bg-red-500/10 text-red-700 border-red-500/20";
  return "bg-muted text-muted-foreground";
}

const statusDot: Record<string, string> = {
  ACTIVE: "bg-emerald-500",
  ON_HOLD: "bg-amber-500",
  "ON HOLD": "bg-amber-500",
  CANCELLED: "bg-red-500",
};

const statusPill: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  ON_HOLD: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  "ON HOLD": "bg-amber-500/10 text-amber-700 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
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
      <div className="shrink-0 flex items-center justify-center size-10 rounded-lg">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-1">
          {label}
        </p>
        <div className="text-sm font-medium text-card-foreground truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function ItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Tour | null>(null);
  const [schedules, setSchedules] = useState<TourScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<TourScheduleResponseDto | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!itemId) return;
      try {
        const tour = await TourService.getById(Number(itemId));
        setItem(tour);

        const sch = await TourScheduleService.getByTourId(Number(itemId));
        setSchedules(sch);
      } catch (err) {
        console.error("Error fetching item or schedules:", err);
        setItem(null);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [itemId]);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }
  if (!item) {
    return <div className="text-center mt-10 text-lg">Item not found</div>;
  }

  const statusLabel = item.status?.replace(/_/g, " ") || "ACTIVE";
  const statusDotClass =
    statusDot[item.status] || statusDot[statusLabel] || "bg-emerald-500";
  const statusPillClass =
    statusPill[item.status] ||
    statusPill[statusLabel] ||
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";

  return (
    <div className="bg-base-100 min-h-screen md:px-6 py-6">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-4">
        <button
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/items");
          }}
          className="btn btn-md btn-outline flex items-center gap-1 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Main layout (new design) */}
      <div className="relative max-w-5xl mx-auto">
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col lg:flex-row">
            {/* Left -- Image gallery */}
            <div className="relative ml-4 mt-4 mr-4 sm:ml-6 sm:mt-6 lg:w-1/2 shrink-0">
              <TourImageGallery images={item.images} title={item.title} />

              {/* Status badge over image */}
              {item.status && (
                <div
                  className={[
                    "absolute top-4 right-4 z-10 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm",
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
              )}

              {/* Type badge */}
              {item.type && (
                <Badge className="absolute top-4 left-4 z-10 bg-base-100/90 backdrop-blur-sm text-card-foreground border border-base-300 shadow-sm text-xs text-white">
                  {item.type}
                </Badge>
              )}
            </div>

            {/* Right -- Details */}
            <div className="flex flex-col flex-1 p-6 lg:p-8 gap-5 min-w-0">
              {/* Header */}
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-card-foreground text-balance">
                  {item.title}
                </h1>

                {item.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
              </div>

              {/* Price block */}
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground">From </span>
                <span className="text-3xl font-bold ml-1 text-card-foreground">
                  {"\u20AC"}
                  {item.price}
                </span>
                <span className="text-sm text-muted-foreground">/person</span>
              </div>

              <div className="h-px bg-base-300" />

              {/* Description */}
              {item.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatTile
                  icon={<Clock className="size-5 text-muted-foreground" />}
                  label="Duration"
                  value={formatDuration(item.timeRequired)}
                />
                <StatTile
                  icon={<Users className="size-5 text-muted-foreground" />}
                  label="Max Group"
                  value={`Up to ${item.participants}`}
                />
                <StatTile
                  icon={<Flame className="size-5 text-muted-foreground" />}
                  label="Intensity"
                  value={
                    <Badge
                      variant="outline"
                      className={[
                        "text-[11px] px-2 py-0 font-medium",
                        getIntensityColor(item.intensity),
                      ].join(" ")}
                    >
                      {item.intensity}
                    </Badge>
                  }
                />
                <StatTile
                  icon={<Globe className="size-5 text-muted-foreground" />}
                  label="Language"
                  value={
                    Array.isArray(item.language) && item.language.length > 0
                      ? item.language.join(", ")
                      : "-"
                  }
                />
              </div>

              {/* Categories */}
              {item.categories && item.categories.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Tag className="size-3.5 shrink-0" />
                    Categories
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="text-xs px-2.5 py-0.5 text-white"
                      >
                        {formatCategory(cat)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-base-300" />

              {/* Schedule picker (existing correct behavior) */}
              <SchedulePicker
                schedules={schedules}
                selectedScheduleId={selectedSchedule?.id}
                onSelect={setSelectedSchedule}
                className="mt-1"
              />

              {/* Book CTA */}
              <button
                type="button"
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold",
                  "w-full lg:w-auto",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100",
                  !selectedSchedule
                    ? "bg-base-200 text-muted-foreground cursor-not-allowed border border-base-300"
                    : [
                        "bg-primary text-primary-content border border-primary/60 shadow-md shadow-black/10",
                        "hover:bg-primary/90 hover:shadow-lg hover:shadow-black/15 hover:-translate-y-[1px]",
                        "active:bg-primary/80 active:shadow-sm active:translate-y-0 active:scale-[0.99]",
                      ].join(" "),
                ].join(" ")}
                onClick={() => setIsModalOpen(true)}
                disabled={!selectedSchedule}
                title={!selectedSchedule ? "Pick a time first" : "Book now"}
              >
                Book Now
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal (existing correct behavior) */}
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
