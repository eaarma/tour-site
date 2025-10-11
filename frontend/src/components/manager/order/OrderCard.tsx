import { Item, OrderResponseDto } from "@/types";

interface Props {
  order: OrderResponseDto;
  tour: Item | null;
  onClick: () => void;
}

export default function OrderCard({ order, tour, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-base-100 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
    >
      <h3 className="text-lg font-semibold">Order #{order.id}</h3>
      <p className="text-sm text-gray-500">Status: {order.status}</p>
      {tour && (
        <p className="text-sm">
          <strong>Tour:</strong> {tour.title}
        </p>
      )}
      <p className="text-sm">
        <strong>Participants:</strong> {order.participants}
      </p>
      <p className="text-sm">
        <strong>Scheduled:</strong>{" "}
        {new Date(order.scheduledAt).toLocaleDateString()}
      </p>
    </div>
  );
}
