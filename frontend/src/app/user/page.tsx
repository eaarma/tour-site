"use client";

import RequireAuth from "@/components/common/RequireAuth";

export default function UserPage() {
  // Dummy data for now
  const numberOfTours = 7;
  const previousTours = [
    { id: 1, name: "Athens City Tour", date: "2024-05-10" },
    { id: 2, name: "Delphi Adventure", date: "2024-04-18" },
  ];
  const upcomingTours = [
    { id: 3, name: "Santorini Sunset Tour", date: "2024-07-01" },
    { id: 4, name: "Meteora Discovery", date: "2024-08-05" },
  ];

  return (
    <RequireAuth requiredRole="USER">
      <main className="bg-base-200 min-h-screen p-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          {/* Statistics Section */}
          <div className="card bg-base-100 shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Your Statistics</h2>
            <p className="text-lg">
              Total Tours Attended:{" "}
              <span className="font-semibold">{numberOfTours}</span>
            </p>
          </div>

          {/* Tours Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Previous Tours */}
            <div className="card flex-1 bg-base-100 shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Previous Tours</h3>
              {previousTours.length > 0 ? (
                <ul className="space-y-2">
                  {previousTours.map((tour) => (
                    <li key={tour.id} className="border rounded p-3">
                      <div className="font-semibold">{tour.name}</div>
                      <div className="text-sm text-gray-500">{tour.date}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No previous tours found.</p>
              )}
            </div>

            {/* Upcoming Tours */}
            <div className="card flex-1 bg-base-100 shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Upcoming Tours</h3>
              {upcomingTours.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingTours.map((tour) => (
                    <li key={tour.id} className="border rounded p-3">
                      <div className="font-semibold">{tour.name}</div>
                      <div className="text-sm text-gray-500">{tour.date}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming tours scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
