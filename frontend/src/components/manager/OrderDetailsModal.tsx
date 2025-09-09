import Modal from "../common/Modal";
import { Item, OrderResponseDto } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponseDto | null;
  tour: Item | null;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  tour,
}: Props) {
  if (!order) return null;

  const checkout = order.checkoutDetails ?? null;

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

      <button onClick={onClose} className="mt-6 btn btn-primary w-full">
        Close
      </button>
    </Modal>
  );
}
