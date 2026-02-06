"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderResponseDto } from "@/types/order";
import { OrderService } from "@/lib/orderService";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await OrderService.getById(id, !isAuthenticated);
        setOrder(data);
      } catch {
        toast.error("Unable to load order");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center">
          Order not found. Returning home...
        </p>
      </div>
    );
  }

  const mainItem = order.items?.[0];

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* HEADER */}
      <div className="text-center mb-10">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Order #{order.id} Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you! Your booking has been received.
        </p>
      </div>

      {/* CARD */}
      <div className="bg-base-100 shadow-lg rounded-xl p-6 space-y-8 border border-base-300">
        {/* ITEMS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Booking</h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="border border-base-200 rounded-lg p-4 flex justify-between"
              >
                <div>
                  <p className="font-medium text-base">{item.tourTitle}</p>

                  <p className="text-sm text-gray-500">
                    {new Date(item.scheduledAt).toLocaleString()}
                  </p>

                  <p className="text-sm text-gray-500">
                    Participants: {item.participants}
                  </p>

                  <p className="text-sm text-gray-500">Status: {item.status}</p>
                </div>

                <div className="text-lg font-bold text-primary">
                  €{item.pricePaid.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CUSTOMER */}
        {mainItem && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Customer</h2>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Name:</span> {mainItem.name}
              </p>
              {isAuthenticated && (
                <>
                  <p>
                    <span className="font-medium">Email:</span> {mainItem.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {mainItem.phone}
                  </p>
                </>
              )}
              {mainItem.nationality && (
                <p>
                  <span className="font-medium">Nationality:</span>{" "}
                  {mainItem.nationality}
                </p>
              )}
            </div>
          </section>
        )}

        {/* PAYMENT */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Payment</h2>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Method:</span> {order.paymentMethod}
            </p>
            <p>
              <span className="font-medium">Total Paid:</span> €
              {order.totalPrice.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Status:</span> {order.status}
            </p>
          </div>
        </section>

        <p className="text-xs text-gray-500">
          Created: {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {/* ACTION */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => router.push("/")}
          className="btn btn-primary btn-lg flex items-center gap-2"
        >
          Go Home
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
