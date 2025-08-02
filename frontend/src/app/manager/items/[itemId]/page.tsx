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

export default function ManagerItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      const dummyItem: Item = {
        id: "1",
        title: "Sunset Sailing Tour",
        description: "Enjoy a relaxing sunset sail along the Aegean coast.",
        image: "/images/sailing.jpg",
        price: "€120",
        timeRequired: "3 hours",
        participants: "4-12",
        intensity: "Low",
        category: "Leisure",
        language: "English",
        location: "Santorini, Greece",
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
      {/* Top Controls: Back + Edit */}
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
        <button className="btn btn-sm btn-ghost" onClick={() => router.back()}>
          ← Back
        </button>
        <button
          className="btn btn-sm btn-outline btn-secondary"
          onClick={() => router.push(`/manager/edit/${item.id}`)}
        >
          Edit
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

            <button className="btn btn-primary mt-4 w-full lg:w-auto" disabled>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
