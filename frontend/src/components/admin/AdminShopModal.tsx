"use client";

import { ShopDto } from "@/types/shop";
import Modal from "@/components/common/Modal";

interface Props {
  shop: ShopDto | null;
  onClose: () => void;
  onRemove: () => void;
  removing: boolean;
}

export default function AdminShopModal({
  shop,
  onClose,
  onRemove,
  removing,
}: Props) {
  return (
    <Modal isOpen={!!shop} onClose={onClose}>
      {shop && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Shop Details</h3>

          <div className="space-y-2 text-sm">
            <p>
              <strong>ID:</strong> {shop.id}
            </p>
            <p>
              <strong>Name:</strong> {shop.name}
            </p>
            <p>
              <strong>Description:</strong> {shop.description || "-"}
            </p>
            <p>
              <strong>Status:</strong> {shop.status}
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button
              className="btn btn-error btn-sm"
              disabled={removing}
              onClick={onRemove}
            >
              {removing ? "Removing..." : "Remove Shop"}
            </button>

            <button className="btn btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
