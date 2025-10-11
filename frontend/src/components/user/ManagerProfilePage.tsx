"use client";

import { useRouter } from "next/navigation";

export default function ManagerProfilePage() {
  const router = useRouter();

  // Dummy data for now
  const numberOfShops = 3;
  const managedShops = [
    { id: 1, name: "Athens Souvenir Store" },
    { id: 2, name: "Santorini Tours" },
    { id: 3, name: "Delphi Guides" },
  ];

  return (
    <main className="bg-base-200 min-h-screen p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Summary Section */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Manager Dashboard</h2>
          <p className="text-lg">
            You manage <span className="font-semibold">{numberOfShops}</span>{" "}
            {numberOfShops === 1 ? "shop" : "shops"}.
          </p>
        </div>

        {/* Managed Shops Section */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Your Shops</h3>
          {managedShops.length > 0 ? (
            <ul className="space-y-3">
              {managedShops.map((shop) => (
                <li
                  key={shop.id}
                  className="border rounded p-3 hover:shadow cursor-pointer transition"
                  onClick={() =>
                    router.push(`/shops/manager?shopId=${shop.id}`)
                  }
                >
                  <div className="font-semibold">{shop.name}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No shops associated with your account.</p>
          )}
        </div>

        {/* Link to Shops Page */}
        <button
          className="btn btn-primary self-start"
          onClick={() => router.push("/shops")}
        >
          Go to Shops Page
        </button>
      </div>
    </main>
  );
}
