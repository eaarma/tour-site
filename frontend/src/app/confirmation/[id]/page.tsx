"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderResponseDto } from "@/types/order";
import toast from "react-hot-toast";
import { OrderService } from "@/lib/orderService";

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const data = await OrderService.getById(id);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError(true);
        toast.error("Could not load order details. Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  useEffect(() => {
    if (!order) return;

    const timer = setTimeout(() => {
      router.push("/");
    }, 30000);

    return () => clearTimeout(timer);
  }, [order, router]);

  if (loading) {
    return <p className="text-gray-500">Loading order confirmation...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500 text-center mt-6">
        ❌ Failed to load order. Redirecting to home...
      </p>
    );
  }

  if (!order) {
    return (
      <p className="text-red-500 text-center mt-6">
        ❌ Order not found. Redirecting to home...
      </p>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 text-center">
      <div className="bg-white shadow-md rounded-2xl p-6 text-left mb-6">
        <h1 className="text-3xl font-bold text-green-600 mb-8 mt-6">
          ✅ Order {order.id} confirmed!
        </h1>
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>

        <ul className="space-y-4 mb-6">
          {(order.items ?? []).map((item) => (
            <li
              key={item.id}
              className="border-b pb-4 flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{item.tourTitle}</p>
                <p className="text-sm text-gray-500">
                  {new Date(item.scheduledAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Participants: {item.participants}
                </p>
                <p className="text-sm text-gray-500">Status: {item.status}</p>
              </div>
              <div className="font-semibold">€{item.pricePaid.toFixed(2)}</div>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
        {order.items[0] && (
          <>
            <p>
              <strong>Name:</strong> {order.items[0].name}
            </p>
            <p>
              <strong>Email:</strong> {order.items[0].email}
            </p>
            <p>
              <strong>Phone:</strong> {order.items[0].phone}
            </p>
            {order.items[0].nationality && (
              <p>
                <strong>Nationality:</strong> {order.items[0].nationality}
              </p>
            )}
          </>
        )}

        <h3 className="text-lg font-semibold mt-4 mb-2">Payment</h3>
        <p>
          <strong>Method:</strong> {order.paymentMethod}
        </p>
        <p>
          <strong>Total Paid:</strong> €{order.totalPrice.toFixed(2)}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>

        <p className="mt-4 text-gray-500 text-sm">
          Order created at: {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <p className="mb-4">Redirecting to home page in 30 seconds...</p>

      <button onClick={() => router.push("/")} className="btn btn-primary">
        Home Page
      </button>
    </main>
  );
}
