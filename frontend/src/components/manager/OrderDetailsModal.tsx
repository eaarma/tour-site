import { OrderService } from "@/lib/orderService";
import Modal from "../common/Modal";
import { Item, OrderResponseDto } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponseDto | null;
  tour: Item | null;
  onOrderUpdated?: (order: OrderResponseDto) => void; // optional callback to refresh parent
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  tour,
  onOrderUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const checkout = order.checkoutDetails ?? null;

  const handleConfirm = async () => {
    if (order.status === "CONFIRMED") {
      toast("Order is already confirmed ✅");
      return;
    }

    setLoading(true);
    try {
      const updated = await OrderService.update(order.id, {
        ...order,
        status: "CONFIRMED",
      });
      toast.success("Order confirmed!");
      if (onOrderUpdated) {
        onOrderUpdated(updated);
      }
    } catch (err) {
      console.error("Failed to confirm order", err);
      toast.error("Failed to confirm order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-2">Order #{order.id}</h2>
      <p className="text-sm text-gray-500 mb-4">
        Status: <span className="font-medium">{order.status}</span>
      </p>

      {tour && (
        <div className="mb-4">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-40 object-cover rounded-lg mb-2"
          />
          <h3 className="text-lg font-semibold">{tour.title}</h3>
          <p className="text-sm text-gray-600">{tour.location}</p>
        </div>
      )}

      <div className="space-y-2">
        <p>
          <strong>Participants:</strong> {order.participants}
        </p>
        <p>
          <strong>Scheduled:</strong>{" "}
          {new Date(order.scheduledAt).toLocaleString()}
        </p>
        <p>
          <strong>Price Paid:</strong> ${order.pricePaid}
        </p>
        <p>
          <strong>Payment Method:</strong> {order.paymentMethod}
        </p>

        {checkout ? (
          <>
            <p>
              <strong>Name:</strong> {checkout.name}
            </p>
            <p>
              <strong>Email:</strong> {checkout.email}
            </p>
            <p>
              <strong>Phone:</strong> {checkout.phone}
            </p>
            <p>
              <strong>Nationality:</strong> {checkout.nationality}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No checkout details available.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {order.status === "CONFIRMED" ? (
          <button onClick={onClose} className="btn btn-primary w-full">
            Ok
          </button>
        ) : (
          <>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn btn-success w-full"
            >
              {loading ? "Confirming..." : "Confirm"}
            </button>
            <button onClick={onClose} className="btn btn-secondary w-full">
              Close
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
