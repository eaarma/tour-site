"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";
import {
  PayoutCreateRequestDto,
  PayoutMethod,
  PayoutShopSummaryDto,
} from "@/types/payout";

type Props = {
  shop: PayoutShopSummaryDto | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: PayoutCreateRequestDto) => Promise<void>;
};

const METHOD_OPTIONS: {
  value: PayoutMethod;
  label: string;
}[] = [
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER", label: "Other" },
];

const formatCurrency = (value: number, currency = "EUR") =>
  `${value.toFixed(2)} ${currency}`;

const formatDate = (value: Date | null) => {
  if (!value) return "-";
  return value.toLocaleDateString("en-GB");
};

export default function AdminPayoutManualModal({
  shop,
  periodStart,
  periodEnd,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>(
    "BANK_TRANSFER",
  );
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountIban, setBankAccountIban] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!shop) return;

    setPayoutMethod("BANK_TRANSFER");
    setBankAccountName(shop.bankAccountName ?? "");
    setBankAccountIban(shop.bankAccountIban ?? "");
    setReference("");
    setNotes("");
  }, [periodEnd, periodStart, shop]);

  if (!shop) return null;

  const requiresBankDetails = payoutMethod === "BANK_TRANSFER";
  const hasBankDetails =
    bankAccountName.trim() !== "" && bankAccountIban.trim() !== "";
  const selectedMethodLabel =
    METHOD_OPTIONS.find((option) => option.value === payoutMethod)?.label ??
    "Manual";
  const resolvedCurrency = shop.currency || "EUR";

  const handleCreatePayout = async () => {
    if (!shop.periodStart || !shop.periodEnd) {
      toast.error("This payout row is missing its payout period");
      return;
    }

    if (requiresBankDetails && !hasBankDetails) {
      toast.error("Add bank account name and IBAN for a bank transfer payout");
      return;
    }

    await onSubmit({
      shopId: shop.shopId,
      periodStart: shop.periodStart,
      periodEnd: shop.periodEnd,
      method: payoutMethod,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      bankAccountName: bankAccountName.trim() || undefined,
      bankAccountIban: bankAccountIban.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={!!shop} onClose={onClose}>
      <div className="space-y-5 sm:space-y-6">
        <div>
          <h3 className="text-lg font-bold">Manual Payout</h3>
          <p className="mt-1 text-sm opacity-70">
            Create a payout record for {shop.shopName} using the selected
            period and the current payout-ready transaction total.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-base-300 p-3 text-sm sm:p-4">
            <p className="text-xs uppercase tracking-wide opacity-60">Shop</p>
            <p className="mt-1 font-semibold">{shop.shopName}</p>
            <p className="text-sm opacity-70">Shop #{shop.shopId}</p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm sm:p-4">
            <p className="text-xs uppercase tracking-wide opacity-60">
              Period Start
            </p>
            <p className="mt-1 font-semibold">{formatDate(periodStart)}</p>
            <p className="text-sm opacity-70">Payout period start</p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm sm:p-4">
            <p className="text-xs uppercase tracking-wide opacity-60">
              Period End
            </p>
            <p className="mt-1 font-semibold">{formatDate(periodEnd)}</p>
            <p className="text-sm opacity-70">
              {shop.transactionCount}{" "}
              {shop.transactionCount === 1 ? "transaction" : "transactions"}
            </p>
          </div>

          <div className="rounded-lg border border-base-300 p-3 text-sm sm:p-4">
            <p className="text-xs uppercase tracking-wide opacity-60">Total</p>
            <p className="mt-1 text-lg font-semibold text-green-600">
              {formatCurrency(shop.totalAmount, resolvedCurrency)}
            </p>
            <p className="text-sm opacity-70">Calculated from eligible rows</p>
          </div>
        </div>

        <div className="rounded-xl border border-base-300 p-4 space-y-4 sm:p-5">
          <div>
            <h4 className="font-semibold">Payout Details</h4>
            <p className="text-sm opacity-70">
              Confirm the payment method and any bank metadata to create the
              payout record for this shop and period.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Method</span>
              <select
                className="select select-bordered w-full"
                value={payoutMethod}
                onChange={(e) =>
                  setPayoutMethod(e.target.value as PayoutMethod)
                }
              >
                {METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Bank Account Name
              </span>
              <input
                type="text"
                className="input input-bordered w-full"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="Account holder name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Bank Account IBAN
              </span>
              <input
                type="text"
                className="input input-bordered w-full"
                value={bankAccountIban}
                onChange={(e) => setBankAccountIban(e.target.value)}
                placeholder="EE00 0000 0000 0000 0000"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Reference
              </span>
              <input
                type="text"
                className="input input-bordered w-full"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Bank reference, receipt ID, note..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Internal Note</span>
            <textarea
              className="textarea textarea-bordered min-h-24 w-full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note for why this payout is being handled manually..."
            />
          </div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 text-sm space-y-2">
          <h4 className="font-semibold">Preview</h4>
          <p>
            <strong>Shop:</strong> {shop.shopName} (#{shop.shopId})
          </p>
          <p>
            <strong>Method:</strong> {selectedMethodLabel}
          </p>
          <p>
            <strong>Period Start:</strong> {formatDate(periodStart)}
          </p>
          <p>
            <strong>Period End:</strong> {formatDate(periodEnd)}
          </p>
          <p>
            <strong>Status On Create:</strong> Completed
          </p>
          <p>
            <strong>Bank Account Name:</strong> {bankAccountName.trim() || "-"}
          </p>
          <p>
            <strong>Bank Account IBAN:</strong> {bankAccountIban.trim() || "-"}
          </p>
          <p>
            <strong>Amount:</strong> {formatCurrency(shop.totalAmount, resolvedCurrency)}
          </p>
          <p className="opacity-80">
            {shop.transactionCount}{" "}
            {shop.transactionCount === 1 ? "transaction" : "transactions"}{" "}
            will be attached to this payout.
          </p>
          {notes.trim() && (
            <p className="opacity-80">
              <strong>Note:</strong> {notes.trim()}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreatePayout}
            disabled={saving || (requiresBankDetails && !hasBankDetails)}
          >
            {saving ? "Creating..." : "Create Payout"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
