"use client";

import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[60vh] text-center">
      <h1 className="text-2xl font-semibold text-red-600 mb-4">
        Unauthorized Access
      </h1>

      <p className="text-gray-600 mb-8">
        You do not have permission to view this page.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Go to Home Page
      </Link>
    </div>
  );
}
