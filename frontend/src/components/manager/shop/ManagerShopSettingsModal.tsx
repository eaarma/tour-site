"use client";

import { useState, useEffect } from "react";
import { ShopDto, ShopCreateRequestDto } from "@/types/shop";
import { ShopService } from "@/lib/shopService";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopDto;
  onShopUpdated: (updated: ShopDto) => void;
}

export default function ManagerShopSettingsModal({
  isOpen,
  onClose,
  shop,
  onShopUpdated,
}: Props) {
  const [name, setName] = useState(shop.name);
  const [description, setDescription] = useState(shop.description ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setDescription(shop.description ?? "");
    }
  }, [shop]);

  const hasChanges =
    name.trim() !== shop.name ||
    description.trim() !== (shop.description ?? "");

  const handleSave = async () => {
    if (!hasChanges) return;
    setLoading(true);
    try {
      const updated = await ShopService.update(shop.id, {
        name: name.trim(),
        description: description.trim(),
      } as ShopCreateRequestDto);
      toast.success("Shop updated ✅");
      onShopUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4">Edit Shop Information</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Shop name:</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Shop description:
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn btn-secondary">
          Close
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className="btn btn-primary"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
}
