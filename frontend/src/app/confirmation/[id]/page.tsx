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
    <div className="min-h-screen bg-base-100 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* ================= HERO ================= */}
        <div className="text-center mb-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-green-600 mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Order #{order.id} has been successfully processed.
          </p>
        </div>

        {/* ================= MAIN CARD ================= */}
        <div className="bg-base-100 shadow-xl rounded-xl border border-base-300 overflow-hidden">
          {/* ================= BOOKINGS ================= */}
          <section className="p-8 border-b border-base-200">
            <h2 className="text-xl font-semibold mb-6">Your Experience</h2>

            <div className="space-y-6">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:justify-between gap-4 p-5 rounded-xl border border-base-200 bg-base-50"
                >
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">{item.tourTitle}</p>

                    <p className="text-sm text-gray-600">
                      📅 {new Date(item.scheduledAt).toLocaleString()}
                    </p>

                    <p className="text-sm text-gray-600">
                      👥 {item.participants} participant(s)
                    </p>

                    {item.tourMeetingPoint && (
                      <p className="text-sm text-gray-600">
                        📍 Meeting Point:{" "}
                        <span className="font-medium">
                          {item.tourMeetingPoint}
                        </span>
                      </p>
                    )}

                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      <span className="font-medium text-green-600">
                        {item.status}
                      </span>
                    </p>
                  </div>

                  <div className="text-xl font-bold text-primary self-start md:self-center">
                    €{item.pricePaid.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= CUSTOMER ================= */}
          {mainItem && (
            <section className="p-8 border-b border-base-200">
              <h2 className="text-xl font-semibold mb-4">Customer Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">
                    Name
                  </p>
                  <p className="font-medium">{mainItem.name}</p>
                </div>

                {isAuthenticated && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase">
                        Email
                      </p>
                      <p className="font-medium">{mainItem.email}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs uppercase">
                        Phone
                      </p>
                      <p className="font-medium">{mainItem.phone}</p>
                    </div>
                  </>
                )}

                {mainItem.nationality && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Nationality
                    </p>
                    <p className="font-medium">{mainItem.nationality}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ================= PAYMENT ================= */}
          <section className="p-8">
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>

            <div className="bg-base-200 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  Method
                </p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  Status
                </p>
                <p className="font-medium text-green-600">{order.status}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  Total Paid
                </p>
                <p className="text-lg font-bold">
                  €{order.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Created on {new Date(order.createdAt).toLocaleString()}
            </p>
          </section>
        </div>

        {/* ================= ACTION ================= */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => router.push("/")}
            className="btn btn-primary btn-lg flex items-center gap-2"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
