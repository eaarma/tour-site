"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Item } from "@/types";
import { TourService } from "@/lib/tourService";
import { TourScheduleService } from "@/lib/TourScheduleService"; // match your import case
import { TourScheduleResponseDto } from "@/types/tourSchedule";
import BookingModal from "@/components/items/BookingModal";
import { formatDuration } from "@/utils/formatDuration";

export default function ItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
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

        // load schedules from schedule service
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

  const formatDateDMY = (isoDate: string) => {
    // isoDate expected to be YYYY-MM-DD
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}.${parts[1]}.${parts[0]}`; // dd.MM.yyyy
  };

  return (
    <main className="bg-base-200 min-h-screen p-6">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-4">
        <button className="btn btn-sm btn-ghost" onClick={() => router.back()}>
          ← Back
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
            <img
              src={item.image || "/images/placeholder-tour.jpg"}
              alt={item.title}
              className="rounded-xl w-full object-cover h-72 lg:h-full"
            />
          </div>

          {/* Details */}
          <div className="lg:w-1/2 flex flex-col justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
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
                  <span className="font-semibold">Category:</span>{" "}
                  {item.category}
                </div>
                <div>
                  <span className="font-semibold">Language:</span>{" "}
                  {item.language}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Location:</span>{" "}
                  {item.location}
                </div>
              </div>
            </div>

            {/* Schedules */}
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Available Times:</h2>
              <div className="flex flex-wrap gap-2">
                {schedules.length > 0 ? (
                  schedules.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`badge p-3 transition cursor-pointer ${
                        selectedSchedule?.id === s.id
                          ? "badge-primary text-white"
                          : "badge-outline"
                      }`}
                      onClick={() => setSelectedSchedule(s)}
                    >
                      {formatDateDMY(s.date)} • {s.time}
                    </button>
                  ))
                ) : (
                  <div className="text-gray-500">No scheduled times yet</div>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary w-full lg:w-auto mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
      {/* Booking Modal - pass selected schedule (see below for required prop changes) */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
        selectedSchedule={selectedSchedule ?? undefined}
        schedules={schedules} // 🔹 added this line
      />
    </main>
  );
}
