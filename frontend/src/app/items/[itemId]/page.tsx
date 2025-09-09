"use client";

import { Item } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TourService } from "@/lib/tourService";
import Image from "next/image";
import BookingModal from "@/components/items/BookingModal";

export default function ItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await TourService.getById(Number(itemId));
        setItem(data);
      } catch (error) {
        console.error("Error fetching item:", error);
        setItem(null);
      }
    };
    if (itemId) fetchItem();
  }, [itemId]);

  if (!item) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  return (
    <main className="bg-base-200 min-h-screen p-6">
      {/* Back Button above card */}
      <div className="max-w-5xl mx-auto mb-4">
        <button className="btn btn-sm btn-ghost" onClick={() => router.back()}>
          ← Back
        </button>
      </div>

      {/* Item Card */}
      <div className="max-w-5xl mx-auto card bg-base-100 shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="lg:w-1/2">
            {/* <Image
              src={item.image}
              alt={item.title}
              width={800}
              height={400}
              className="rounded-xl w-full object-cover h-72 lg:h-full"
            /> */}
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
                  {item.timeRequired}
                </div>
                <div>
                  <span className="font-semibold">Participants:</span>{" "}
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
                <div>
                  <span className="font-semibold">Location:</span>{" "}
                  {item.location}
                </div>
              </div>
            </div>

            {/* ✅ Single button to open booking modal */}
            <button
              className="btn btn-primary w-full lg:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
      />
    </main>
  );
}
