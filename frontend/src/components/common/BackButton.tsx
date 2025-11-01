"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string; // optional fallback, e.g. "/items"
  label?: string; // optional custom label, default is "Back"
  className?: string; // optional for extra styling if needed
}

export default function BackButton({
  fallbackUrl = "/",
  label = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto mb-4 ${className}`}>
      <button
        onClick={handleBack}
        className="btn btn-outline btn-primary btn-md flex items-center gap-2 transition-all hover:gap-3 shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </button>
    </div>
  );
}
