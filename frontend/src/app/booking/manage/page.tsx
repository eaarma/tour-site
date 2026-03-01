"use client";

import { BookingService } from "@/lib/bookingService";
import { OrderResponseDto, OrderItemResponseDto } from "@/types/order";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

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
        <OrderItemCard key={item.id} item={item} router={router} />
      ))}
    </div>
  );
}

/* --------------------------- ITEM CARD --------------------------- */

function OrderItemCard({
  item,
  router,
}: {
  item: OrderItemResponseDto;
  router: AppRouterInstance;
}) {
  const scheduled = format(
    new Date(item.scheduledAt),
    "EEEE, dd MMM yyyy HH:mm",
  );

  const handleCancel = () => {
    alert("This would commence the cancellation.");
  };

  return (
    <div className="bg-base-100 shadow-xl rounded-xl border border-base-300 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        {/* Left */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{item.tourTitle}</h2>

          <div className="text-sm text-base-content/70 space-y-1">
            <p>
              <strong>Date:</strong> {scheduled}
            </p>
            <p>
              <strong>Participants:</strong> {item.participants}
            </p>
            <p>
              <strong>Meeting Point:</strong>{" "}
              {item.tourMeetingPoint || "Provided after confirmation"}
            </p>
            <p>
              <strong>Status:</strong> {item.status}
            </p>
          </div>

          <div className="text-sm pt-2">
            <p className="font-semibold">€{item.pricePaid.toFixed(2)}</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => router.push(`/tours/${item.tourId}`)}
            className="btn btn-outline btn-sm"
          >
            View Tour
          </button>

          <button onClick={handleCancel} className="btn btn-error btn-sm">
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}
