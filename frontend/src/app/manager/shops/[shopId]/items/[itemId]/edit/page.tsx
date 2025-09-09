"use client";

import { useParams } from "next/navigation";
import EditAddItemForm from "@/components/manager/EditAddItemForm";
import RequireAuth from "@/components/common/RequireAuth";

export default function EditItemPage() {
  const params = useParams();
  const shopId = Number(params.shopId);
  const itemId = Number(params.itemId);

  return (
    <RequireAuth requiredRole="MANAGER">
      <main className="bg-base-200 min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Tour</h1>
        <EditAddItemForm mode="edit" shopId={shopId} itemId={itemId} />
      </main>
    </RequireAuth>
  );
}
