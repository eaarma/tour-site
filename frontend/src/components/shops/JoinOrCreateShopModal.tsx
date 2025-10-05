"use client";

import { useState } from "react";
import { X, Search, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { ShopService } from "@/lib/shopService";
import { ShopUserService } from "@/lib/shopUserService";
import { ShopDto } from "@/types/shop";

interface JoinOrCreateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void; // optional refresh callback
}

export default function JoinOrCreateShopModal({
  isOpen,
  onClose,
  onActionComplete,
}: JoinOrCreateShopModalProps) {
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");

  // 🔍 Join shop state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "id">("name");
  const [results, setResults] = useState<ShopDto[]>([]);
  const [loading, setLoading] = useState(false);

  // 🏗 Create shop state
  const [newShopName, setNewShopName] = useState("");
  const [newShopDescription, setNewShopDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const allShops = await ShopService.getAll();
      const filtered =
        searchBy === "name"
          ? allShops.filter((s) =>
              s.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : allShops.filter((s) => s.id.toString() === searchTerm.trim());
      setResults(filtered);
    } catch (err) {
      console.error("Search failed", err);
      toast.error("Failed to search shops");
    } finally {
      setLoading(false);
    }
  };

  const handleSendJoinRequest = async (shopId: number) => {
    try {
      await ShopUserService.requestJoinShop(shopId);
      toast.success("Join request sent successfully ✅");
      onClose();
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to send join request", err);
      toast.error("Failed to send join request");
    }
  };

  const handleCreateShop = async () => {
    if (!newShopName.trim()) {
      toast.error("Shop name is required");
      return;
    }
    setCreating(true);
    try {
      const created = await ShopService.create({
        name: newShopName,
        description: newShopDescription || undefined,
      });
      toast.success(`Shop "${created.name}" created successfully 🎉`);
      onClose();
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to create shop", err);
      toast.error("Failed to create shop");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header with close */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Join or Create a Shop</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === "join" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("join")}
        >
          Join Existing Shop
        </button>
        <button
          className={`tab ${activeTab === "create" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create New Shop
        </button>
      </div>

      {activeTab === "join" ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as "name" | "id")}
              className="select select-bordered select-sm"
            >
              <option value="name">By name</option>
              <option value="id">By ID</option>
            </select>
            <input
              type="text"
              placeholder={`Search shop by ${searchBy}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered input-sm flex-1"
            />
            <button
              className="btn btn-sm btn-primary flex items-center gap-1"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto space-y-3 mt-2">
            {results.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No results to display.
              </p>
            ) : (
              results.map((shop) => (
                <div
                  key={shop.id}
                  className="p-3 border rounded-lg hover:border-primary hover:bg-base-200 transition cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{shop.name}</p>
                    <p className="text-xs text-gray-500">ID: {shop.id}</p>
                  </div>
                  <button
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() => handleSendJoinRequest(shop.id)}
                  >
                    Send Request
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Shop name"
            className="input input-bordered"
            value={newShopName}
            onChange={(e) => setNewShopName(e.target.value)}
          />
          <textarea
            placeholder="Shop description (optional)"
            className="textarea textarea-bordered"
            value={newShopDescription}
            onChange={(e) => setNewShopDescription(e.target.value)}
          />
          <button
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            onClick={handleCreateShop}
            disabled={creating}
          >
            <PlusCircle className="w-4 h-4" />
            {creating ? "Creating..." : "Create Shop"}
          </button>
        </div>
      )}
    </Modal>
  );
}
