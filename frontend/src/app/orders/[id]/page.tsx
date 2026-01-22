"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderResponseDto } from "@/types/order";
import { OrderService } from "@/lib/orderService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  CalendarClock,
  Euro,
} from "lucide-react";

export default function ViewOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        // 👇 always guest version here
        const data = await OrderService.getById(id as string, true);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError(true);
        toast.error("Could not find booking with that id.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-10">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="text-center mt-10 text-red-500">Order not found</div>
    );
  }

  const firstItem = order.items[0];

  return (
    <main className="min-h-screen bg-base-200 p-6 flex justify-center">
      {error && <p className="text-red-500 mt-4">Failed to load booking.</p>}

      <div className="max-w-3xl w-full">
        <button onClick={() => router.back()} className="btn btn-outline mb-6">
          <ArrowLeft /> Back
        </button>

        <div className="bg-base-100 shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-semibold mb-8">Booking #{order.id}</h1>

          {/* items list */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Booked Tours</h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 shadow-sm bg-base-100"
                >
                  <p className="font-medium text-primary">{item.tourTitle}</p>

                  <p className="mt-1 text-sm text-gray-500">
                    <CalendarClock className="inline w-4 h-4" />{" "}
                    {new Date(item.scheduledAt).toLocaleString()}
                  </p>

                  <p className="text-sm text-gray-500">
                    Participants: {item.participants}
                  </p>

                  <p className="text-sm text-gray-500">Status: {item.status}</p>

                  <p className="text-sm font-semibold mt-2">
                    <Euro className="inline w-4 h-4" />{" "}
                    {item.pricePaid.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* customer */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Customer</h2>

            {firstItem && (
              <>
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {firstItem.name}
                </p>

                <>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {firstItem.email}
                  </p>

                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {firstItem.phone}
                  </p>
                </>
              </>
            )}
          </section>

          {/* payment */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Payment</h2>
            <p>
              <strong>Method:</strong> {order.paymentMethod}
            </p>
            <p>
              <strong>Total Paid:</strong> €{order.totalPrice.toFixed(2)}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Created at {new Date(order.createdAt).toLocaleString()}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
