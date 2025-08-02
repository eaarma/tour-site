"use client";

import PaymentMethodSection from "@/components/payment/PaymentMethodSection";
import PaymentSummarySection from "@/components/payment/PaymentSummarySection";
import PaymentTotalSection from "@/components/payment/PaymentTotalSection";
import { useState } from "react";

// Mock data
const mockCartItems = [
  {
    id: 1,
    name: "Santorini Sunset Tour",
    quantity: 2,
    price: 45.0,
  },
  {
    id: 2,
    name: "Athens Historical Walk",
    quantity: 1,
    price: 30.0,
  },
];

const mockContactInfo = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+30 6941234567",
  nationality: "Greece",
};

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState<"credit" | "link">(
    "credit"
  );
  const [subtotal] = useState(
    mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const [loading, setLoading] = useState(false);

  const handleProceed = () => {
    setLoading(true);
    setTimeout(() => {
      if (selectedMethod === "link") {
        window.open("https://example.com/payment-link", "_blank");
      } else {
        alert("Processing credit card payment...");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left Column: Summary + Payment Method */}
        <div className="flex-1 space-y-6">
          <PaymentSummarySection
            items={mockCartItems}
            contact={mockContactInfo}
          />
          <PaymentMethodSection
            selected={selectedMethod}
            onSelect={setSelectedMethod}
          />
        </div>

        {/* Right Column: Total */}
        <div className="flex justify-center md:block md:w-[320px] md:self-start">
          <PaymentTotalSection
            subtotal={subtotal}
            tax={5}
            onProceed={handleProceed}
            isLoading={loading}
          />
        </div>
      </div>
    </main>
  );
}
