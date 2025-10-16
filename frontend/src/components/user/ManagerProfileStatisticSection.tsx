"use client";

interface Props {
  shopsCount: number;
  toursGiven: number;
  upcomingTours: number;
}

export default function ManagerProfileStatisticSection({
  shopsCount,
  toursGiven,
  upcomingTours,
}: Props) {
  return (
    <div className="card bg-base-100 shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-lg p-4 text-center">
          <div className="stat-title text-gray-600">Member of</div>
          <div className="stat-value text-xl font-semibold">{shopsCount}</div>
          <div className="stat-desc text-sm">Shops</div>
        </div>

        <div className="stat bg-base-200 rounded-lg p-4 text-center">
          <div className="stat-title text-gray-600">Tours Given</div>
          <div className="stat-value text-xl font-semibold">{toursGiven}</div>
        </div>

        <div className="stat bg-base-200 rounded-lg p-4 text-center">
          <div className="stat-title text-gray-600">Upcoming Tours</div>
          <div className="stat-value text-xl font-semibold">
            {upcomingTours}
          </div>
        </div>
      </div>
    </div>
  );
}
