"use client";

import { BookingService } from "@/lib/bookingService";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ManageBookingPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "valid" | "invalid">(
    "loading",
  );

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    BookingService.validateToken(token)
      .then(() => setStatus("valid"))
      .catch(() => setStatus("invalid"));
  }, [token]);

  if (status === "loading") {
    return <div className="p-8">Checking booking...</div>;
  }

  if (status === "invalid") {
    return <div className="p-8 text-red-600">Invalid or expired link.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Booking Found</h1>
      <p>This is a placeholder page.</p>
    </div>
  );
}
