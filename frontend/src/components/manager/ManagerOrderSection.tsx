"use client";

import { useState } from "react";
import Image from "next/image";

type OrderStatus = "Pending" | "Confirmed" | "Cancelled";

interface Order {
  id: number;
  imageUrl: string;
  title: string;
  date: string;
  time: string;
  status: OrderStatus;
}

const activeOrders: Order[] = [
  {
    id: 1,
    imageUrl: "/images/tour1.jpg",
    title: "Santorini Sunset Tour",
    date: "2025-07-04",
    time: "18:00",
    status: "Pending",
  },
  {
    id: 2,
    imageUrl: "/images/tour2.jpg",
    title: "Athens Historical Walk",
    date: "2025-07-06",
    time: "10:00",
    status: "Confirmed",
  },
];

const pastOrders: Order[] = [
  {
    id: 3,
    imageUrl: "/images/tour3.jpg",
    title: "Crete Hiking Experience",
    date: "2025-05-15",
    time: "08:00",
    status: "Confirmed",
  },
];

export default function ManagerOrderSection() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [orders, setOrders] = useState(activeOrders);

  const handleConfirm = (id: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: "Confirmed" } : order
      )
    );
  };

  const renderOrderCard = (order: Order) => (
    <div
      key={order.id}
      className="card bg-base-100 shadow-md border flex flex-col md:flex-row gap-4 p-4 items-center"
    >
      <div className="relative w-24 h-24 rounded-md overflow-hidden">
        <Image
          src={order.imageUrl}
          alt={order.title}
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="flex-1 w-full">
        <h3 className="text-lg font-semibold">{order.title}</h3>
        <p className="text-sm text-base-content/70">
          {order.date} at {order.time}
        </p>
        <p className="mt-1 text-sm font-medium">
          Status:{" "}
          <span
            className={`badge ${
              order.status === "Confirmed"
                ? "badge-success"
                : order.status === "Pending"
                ? "badge-warning"
                : "badge-error"
            }`}
          >
            {order.status}
          </span>
        </p>
      </div>

      {order.status !== "Confirmed" && (
        <button
          className="btn btn-sm btn-primary mt-2 md:mt-0"
          onClick={() => handleConfirm(order.id)}
        >
          Confirm
        </button>
      )}
    </div>
  );

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>

      <div role="tablist" className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("active")}
          role="tab"
        >
          Active
        </button>
        <button
          className={`tab ${activeTab === "past" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("past")}
          role="tab"
        >
          Past
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "active"
          ? orders.map(renderOrderCard)
          : pastOrders.map(renderOrderCard)}
      </div>
    </section>
  );
}
