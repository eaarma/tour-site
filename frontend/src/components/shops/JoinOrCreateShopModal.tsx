"use client";

import { useState } from "react";
import {
  Building2,
  ChevronRight,
  Hash,
  PlusCircle,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { ShopService } from "@/lib/shops/shopService";
import { ShopUserService } from "@/lib/shops/shopUserService";
import { ShopDto } from "@/types/shop";

interface JoinOrCreateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void | Promise<void>;
}

export default function JoinOrCreateShopModal({
  isOpen,
  onClose,
  onActionComplete,
}: JoinOrCreateShopModalProps) {
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "id">("name");
  const [results, setResults] = useState<ShopDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [newShopName, setNewShopName] = useState("");
  const [newShopDescription, setNewShopDescription] = useState("");
  const [newShopBankAccountName, setNewShopBankAccountName] = useState("");
  const [newShopBankAccountIban, setNewShopBankAccountIban] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSearch = async () => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const page = await ShopService.getAll({
        query: trimmedSearch,
        status: "ACTIVE",
        page: 0,
        size: 20,
      });

      const filtered =
        searchBy === "id"
          ? page.content.filter(
              (shop: ShopDto) => shop.id.toString() === trimmedSearch,
            )
          : page.content;

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
      toast.success("Join request sent successfully");
      onClose();
      await onActionComplete?.();
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
        bankAccountName: newShopBankAccountName.trim() || undefined,
        bankAccountIban: newShopBankAccountIban.trim() || undefined,
      });

      toast.success(`Shop "${created.name}" created successfully`);
      onClose();
      await onActionComplete?.();
    } catch (err) {
      console.error("Failed to create shop", err);
      toast.error("Failed to create shop");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Building2 className="size-3.5" />
            Shop Access
          </div>
          <div className="space-y-2">
            <h2 className="pr-10 text-2xl font-semibold tracking-tight">
              Join or create a shop
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-2xl bg-base-200 p-1.5 sm:grid-cols-2">
          <button
            type="button"
            className={`rounded-[1rem] px-4 py-3 text-left transition ${
              activeTab === "join"
                ? "bg-base-100 text-base-content shadow-sm"
                : "text-muted-foreground hover:bg-base-100/70 hover:text-base-content"
            }`}
            onClick={() => setActiveTab("join")}
          >
            <p className="text-sm font-semibold">Join existing shop</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Search by name or ID and send a request.
            </p>
          </button>
          <button
            type="button"
            className={`rounded-[1rem] px-4 py-3 text-left transition ${
              activeTab === "create"
                ? "bg-base-100 text-base-content shadow-sm"
                : "text-muted-foreground hover:bg-base-100/70 hover:text-base-content"
            }`}
            onClick={() => setActiveTab("create")}
          >
            <p className="text-sm font-semibold">Create new shop</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Set up a fresh workspace for your operation.
            </p>
          </button>
        </div>

        {activeTab === "join" ? (
          <div className=" p-4  sm:p-5">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Find an existing shop</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Use a public shop name or exact shop ID to locate the workspace
                you want to join.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-end">
              <label className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Search by
                </span>
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value as "name" | "id")}
                  className="select select-bordered w-full"
                >
                  <option value="name">Name</option>
                  <option value="id">Shop ID</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Search term
                </span>
                <input
                  type="text"
                  placeholder={
                    searchBy === "id"
                      ? "Enter exact shop ID"
                      : "Search by shop name"
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleSearch();
                    }
                  }}
                  className="input input-bordered w-full"
                />
              </label>

              <button
                type="button"
                className="btn btn-primary h-12 gap-2 px-5"
                onClick={() => void handleSearch()}
                disabled={loading}
              >
                <Search className="size-4" />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
              {!hasSearched ? (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-4 py-6 text-center">
                  <p className="text-sm font-medium">Start with a search</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Search for a shop by name or ID, then send a join request to
                    the team.
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-4 py-6 text-center">
                  <p className="text-sm font-medium">No matching shops found</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Try a broader name search or check that the shop ID is
                    correct.
                  </p>
                </div>
              ) : (
                results.map((shop) => (
                  <div
                    key={shop.id}
                    className="rounded-2xl border border-base-300 bg-base-100 px-4 py-4 transition hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold sm:text-base">
                            {shop.name}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200 px-2 py-1 text-[11px] text-muted-foreground">
                            <Hash className="size-3" />
                            {shop.id}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {shop.description?.trim() ||
                            "No public description has been added for this shop yet."}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline btn-primary shrink-0 gap-1.5"
                        onClick={() => void handleSendJoinRequest(shop.id)}
                      >
                        Send request
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-4  sm:p-5">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Create a new shop</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Start with the core details now. Optional payout information can
                be refined later.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Shop name
                </span>
                <input
                  type="text"
                  placeholder="Enter the shop name"
                  className="input input-bordered w-full"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Description
                </span>
                <textarea
                  placeholder="Give the shop a short public description"
                  className="textarea textarea-bordered min-h-28 w-full"
                  value={newShopDescription}
                  onChange={(e) => setNewShopDescription(e.target.value)}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Bank account name
                  </span>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="input input-bordered w-full"
                    value={newShopBankAccountName}
                    onChange={(e) => setNewShopBankAccountName(e.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    IBAN
                  </span>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="input input-bordered w-full"
                    value={newShopBankAccountIban}
                    onChange={(e) => setNewShopBankAccountIban(e.target.value)}
                  />
                </label>
              </div>

              <button
                type="button"
                className="btn btn-primary mt-2 h-12 w-full gap-2"
                onClick={() => void handleCreateShop()}
                disabled={creating}
              >
                <PlusCircle className="size-4" />
                {creating ? "Creating..." : "Create shop"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
