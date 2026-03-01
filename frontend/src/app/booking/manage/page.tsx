"use client";

import { BookingService } from "@/lib/bookingService";
import { OrderResponseDto } from "@/types/order";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import ManageOrderItemCard from "@/components/manageBooking/ManageOrderItemCard";

export default function ManageBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "invalid" | "ready">(
    "loading",
  );
  const [order, setOrder] = useState<OrderResponseDto | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    BookingService.getByToken(token)
      .then((res) => {
        setOrder(res);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  if (status === "loading") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-base-100 shadow-xl rounded-xl border border-base-300 p-6">
          Checking booking...
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-base-100 shadow-xl rounded-xl border border-base-300 p-6 text-red-600">
          Invalid or expired booking link.
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      {/* Order Summary */}
      <div className="bg-base-100 shadow-xl rounded-xl border border-base-300 p-6">
        <h1 className="text-2xl font-bold mb-4">Booking #{order.id}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-base-content/60">Status</p>
            <p className="font-semibold">{order.status}</p>
          </div>

          <div>
            <p className="text-base-content/60">Total Paid</p>
            <p className="font-semibold">€{order.totalPrice.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-base-content/60">Created</p>
            <p className="font-semibold">
              {format(new Date(order.createdAt), "PPP p")}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {order.items.map((item) => (
        <ManageOrderItemCard
          key={item.id}
          item={item}
          router={router}
          token={token!}
          onCancelled={(itemId, newStatus) => {
            setOrder((prev) =>
              prev
                ? {
                    ...prev,
                    items: prev.items.map((i) =>
                      i.id === itemId ? { ...i, status: newStatus } : i,
                    ),
                  }
                : prev,
            );
          }}
        />
      ))}
    </div>
  );
}
