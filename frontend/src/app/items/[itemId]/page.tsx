"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Item {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  timeRequired: string;
  participants: string;
  intensity: string;
  category: string;
  language: string;
  location: string;
}

export default function ItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      const dummyItem: Item = {
        id: "1",
        title: "Acropolis Tour",
        description:
          "A guided tour through the historic Acropolis site with stunning views of Athens.",
        image: "/images/acropolis.jpg",
        price: "€50",
        timeRequired: "2 hours",
        participants: "2-10",
        intensity: "Medium",
        category: "History",
        language: "English",
        location: "Athens, Greece",
      };

      setItem(dummyItem); // Replace with real data fetching
    };

    fetchItem();
  }, [id]);

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
            <img
              src={item.image}
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

            {/* ✅ Add to Cart button */}
            <button className="btn btn-secondary w-full lg:w-auto">
              Add to Cart
            </button>

            {/* ✅ Book Now button */}
            <button className="btn btn-primary w-full lg:w-auto">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
