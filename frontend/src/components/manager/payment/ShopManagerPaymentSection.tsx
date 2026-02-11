"use client";

import { useEffect, useState } from "react";
import { PaymentLineResponseDto } from "@/types/paymentLine";
import { PaymentLineService } from "@/lib/PaymentLineService";

interface Props {
  shopId: number;
}

export default function ShopManagerPaymentSection({ shopId }: Props) {
  const [payments, setPayments] = useState<PaymentLineResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await PaymentLineService.getByShopId(shopId);
        setPayments(data);
      } catch (err) {
        console.error("Failed to load payments", err);
        setError("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [shopId]);

  // ============================
  // Loading state
  // ============================
  if (loading) {
    return <div className="p-6">Loading payments...</div>;
  }

  // ============================
  // Error state
  // ============================
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  // ============================
  // Empty state
  // ============================
  if (payments.length === 0) {
    return (
      <div className="p-6 text-gray-600">
        No unpaid payments found for this shop.{" "}
      </div>
    );
  }

  // ============================
  // Totals
  // ============================
  const totalGross = payments.reduce((sum, p) => sum + p.grossAmount, 0);

  const totalPlatform = payments.reduce((sum, p) => sum + p.platformFee, 0);

  const totalShop = payments.reduce((sum, p) => sum + p.shopAmount, 0);

  // ============================
  // Render
  // ============================
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-base-200 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Gross Amount</p>
          <p className="text-xl font-semibold">€{totalGross.toFixed(2)}</p>
        </div>

        <div className="p-4 bg-base-200 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Platform Fees</p>
          <p className="text-xl font-semibold">€{totalPlatform.toFixed(2)}</p>
        </div>

        <div className="p-4 bg-base-200 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">You Receive</p>
          <p className="text-xl font-semibold text-green-600">
            €{totalShop.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payments table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order</th>
              <th>Gross</th>
              <th>Fee</th>
              <th>Shop Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.createdAt).toLocaleString()}</td>

                <td>#{p.orderId}</td>

                <td>€{p.grossAmount.toFixed(2)}</td>

                <td>€{p.platformFee.toFixed(2)}</td>

                <td className="font-semibold text-green-600">
                  €{p.shopAmount.toFixed(2)}
                </td>

                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
