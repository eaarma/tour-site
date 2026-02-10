"use client";

import React from "react";

type CheckoutItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  quantity: number;
  price: number;
};

type ContactInfo = {
  name: string;
  email: string;
  phone: string;
  nationality?: string;
};

type PaymentSummarySectionProps = {
  items: CheckoutItem[];
  contact: ContactInfo;
};

export default function PaymentSummarySection({
  items,
  contact,
}: PaymentSummarySectionProps) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

      {items.length === 0 && (
        <div className="text-center text-warning font-medium">
          No items selected for checkout
        </div>
      )}

      {/* Item List */}
      <ul className="space-y-4 mb-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-start border-b pb-4"
          >
            <div className="space-y-1">
              <p className="font-medium text-lg">{item.title}</p>
              <p className="text-sm text-gray-500">
                {item.date} at {item.time}
              </p>
              <p className="text-sm text-gray-500">
                Quantity: {item.quantity} × €{item.price.toFixed(2)}
              </p>
            </div>
            <div className="text-right font-medium text-lg">
              €{(item.price * item.quantity).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      {/* Contact Info */}
      <div className="bg-base-200 p-4 rounded-lg space-y-1">
        <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
        <p>
          <span className="font-medium">Name:</span> {contact.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {contact.email}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {contact.phone}
        </p>
        {contact.nationality && (
          <p>
            <span className="font-medium">Nationality:</span>{" "}
            {contact.nationality}
          </p>
        )}
      </div>

      {/* Total */}
      <div className="mt-6 text-right text-xl font-bold">
        Total: €{total.toFixed(2)}
      </div>
    </div>
  );
}
