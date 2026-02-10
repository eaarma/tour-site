"use client";

import { useEffect, useState } from "react";
import { PaymentDto } from "@/types/payment";
import { PaymentService } from "@/lib/PaymentService";

interface Props {
  shopId: number;
}

export default function ShopManagerPaymentSection({ shopId }: Props) {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await PaymentService.getByShopId(shopId);
        setPayments(data);
      } catch (err) {
        console.error("Failed to load payments", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [shopId]);

  if (loading) {
    return <div className="p-6">Loading payments...</div>;
  }

  if (payments.length === 0) {
    return <div className="p-6 text-gray-600">No payments yet.</div>;
  }

  const totalEarned = payments.reduce((sum, p) => sum + p.shopAmount, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Earnings Summary</h3>
        <p>
          Total earned:{" "}
          <span className="font-bold">€{totalEarned.toFixed(2)}</span>
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Total</th>
              <th>Fee</th>
              <th>Shop</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>#{p.orderId}</td>

                <td>{new Date(p.createdAt).toLocaleDateString()}</td>

                <td>€{p.amountTotal.toFixed(2)}</td>

                <td className="text-red-500">-€{p.platformFee.toFixed(2)}</td>

                <td className="font-semibold text-green-600">
                  €{p.shopAmount.toFixed(2)}
                </td>

                <td>
                  <span
                    className={`badge ${
                      p.status === "SUCCEEDED"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
