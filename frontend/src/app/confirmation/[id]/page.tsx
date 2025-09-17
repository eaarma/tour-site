"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderService } from "@/services/orderService";
import { OrderResponseDto } from "@/types/order";
import toast from "react-hot-toast";

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

    // auto redirect after 30s only if order exists
    let timer: NodeJS.Timeout;
    if (order) {
      timer = setTimeout(() => {
        router.push("/");
      }, 30000);
    }

    return () => clearTimeout(timer);
  }, [id, router, order]);

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
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Order {order.id} confirmed!
      </h1>

      <div className="bg-white shadow-md rounded-2xl p-6 text-left mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>

        <p>
          <strong>Tour ID:</strong> {order.tourId}
        </p>
        <p>
          <strong>Participants:</strong> {order.participants}
        </p>
        <p>
          <strong>Scheduled At:</strong>{" "}
          {new Date(order.scheduledAt).toLocaleString()}
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Customer Details</h3>
        <p>
          <strong>Name:</strong> {order.checkoutDetails.name}
        </p>
        <p>
          <strong>Email:</strong> {order.checkoutDetails.email}
        </p>
        <p>
          <strong>Phone:</strong> {order.checkoutDetails.phone}
        </p>
        <p>
          <strong>Nationality:</strong> {order.checkoutDetails.nationality}
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Payment</h3>
        <p>
          <strong>Method:</strong> {order.paymentMethod}
        </p>
        <p>
          <strong>Amount Paid:</strong> {order.pricePaid} €
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
