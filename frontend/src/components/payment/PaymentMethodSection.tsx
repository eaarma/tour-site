"use client";

import { useState } from "react";

type PaymentMethod = "credit-card" | "pay-link";

type PaymentMethodSectionProps = {
  onChange: (method: PaymentMethod, cardInfo?: CardInfo) => void;
};

type CardInfo = {
  cardNumber: string;
  expiry: string;
  cvc: string;
};

export default function PaymentMethodSection({
  onChange,
}: PaymentMethodSectionProps) {
  const [method, setMethod] = useState<PaymentMethod>("credit-card");
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const handleMethodChange = (newMethod: PaymentMethod) => {
    setMethod(newMethod);
    onChange(newMethod, cardInfo);
  };

  const handleCardChange = (field: keyof CardInfo, value: string) => {
    const updated = { ...cardInfo, [field]: value };
    setCardInfo(updated);
    if (method === "credit-card") {
      onChange(method, updated);
    }
  };

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-md w-full max-w-2xl mt-6">
      <h2 className="text-2xl font-semibold mb-4">Select Payment Method</h2>

      {/* Toggle Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          className={`btn w-1/2 ${
            method === "credit-card" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => handleMethodChange("credit-card")}
        >
          Credit Card
        </button>
        <button
          type="button"
          className={`btn w-1/2 ${
            method === "pay-link" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => handleMethodChange("pay-link")}
        >
          Pay through Link
        </button>
      </div>

      {/* Credit Card Fields */}
      {method === "credit-card" && (
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Card Number</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="1234 5678 9012 3456"
              value={cardInfo.cardNumber}
              onChange={(e) => handleCardChange("cardNumber", e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="label">
                <span className="label-text">Expiry</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="MM/YY"
                value={cardInfo.expiry}
                onChange={(e) => handleCardChange("expiry", e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="label">
                <span className="label-text">CVC</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="123"
                value={cardInfo.cvc}
                onChange={(e) => handleCardChange("cvc", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pay through Link Message */}
      {method === "pay-link" && (
        <div className="alert alert-info mt-4">
          A secure payment link will open on the next page.
        </div>
      )}
    </div>
  );
}
