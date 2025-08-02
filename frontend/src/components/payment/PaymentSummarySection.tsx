"use client";

import React from "react";

type CheckoutItem = {
  id: string;
  title: string;
  date: string;
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
    0
  );

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

      {/* Item List */}
      <ul className="space-y-3 mb-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-start border-b pb-2"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">Date: {item.date}</p>
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
            </div>
            <div className="text-right font-medium">
              €{(item.price * item.quantity).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      {/* Contact Info */}
      <div className="bg-base-200 p-4 rounded-lg">
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

      {/* Optional: Display total here if needed */}
      <div className="mt-4 text-right text-lg font-bold">
        Total: €{total.toFixed(2)}
      </div>
    </div>
  );
}
