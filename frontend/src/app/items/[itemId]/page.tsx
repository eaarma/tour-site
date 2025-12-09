"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tour } from "@/types";
import { TourService } from "@/lib/tourService";
import { tourScheduleService } from "@/lib/tourScheduleService";
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import BookingModal from "@/components/items/BookingModal";
import { formatDuration } from "@/utils/formatDuration";
import SchedulePicker from "@/components/items/SchedulePicker";
import { ArrowLeft } from "lucide-react";
import TourImageGallery from "@/components/common/TourImageGallery";

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

        const sch = await tourScheduleService.getByTourId(Number(itemId));
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

  return (
    <main className="bg-base-200 min-h-screen p-6">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-4">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              // Fallback: go to the items page if there's no history
              router.push(`/items`);
            }
          }}
          className="btn btn-md btn-outline flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Main Card */}
      <div className="relative max-w-5xl mx-auto card bg-base-100 shadow-lg p-6">
        {/* Status Badge */}
        <div
          className={`absolute top-4 right-4 tooltip`}
          data-tip={`Current status of this tour is ${item?.status}`}
        >
          <span
            className={`badge ${
              item?.status === "ACTIVE"
                ? "badge-success"
                : item?.status === "ON HOLD"
                ? "badge-warning"
                : "badge-error"
            }`}
          >
            {item?.status}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="lg:w-1/2">
            <TourImageGallery images={item.images} title={item.title} />
          </div>

          {/* Details */}
          <div className="lg:w-1/2 flex flex-col justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>

              <div className="col-span-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {item.type}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{item.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Price:</span> {item.price}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span>{" "}
                  {formatDuration(item.timeRequired)}
                </div>
                <div>
                  <span className="font-semibold">Max participants:</span>{" "}
                  {item.participants}
                </div>
                <div>
                  <span className="font-semibold">Intensity:</span>{" "}
                  {item.intensity}
                </div>
                <div>
                  <span className="font-semibold">Language:</span>{" "}
                  {" " + item?.language?.join(", ")}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Location:</span>{" "}
                  {item.location}
                </div>

                <div className="col-span-2">
                  <span className="font-semibold">Categories</span>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.categories?.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                      >
                        {cat.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Schedules (picker) */}
            <SchedulePicker
              schedules={schedules}
              selectedScheduleId={selectedSchedule?.id}
              onSelect={setSelectedSchedule}
              className="mt-2"
            />

            <button
              className="btn btn-primary w-full lg:w-auto mt-2"
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedSchedule}
              title={!selectedSchedule ? "Pick a time first" : "Book now"}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
        selectedSchedule={selectedSchedule ?? undefined}
        schedules={schedules}
      />
    </main>
  );
}
