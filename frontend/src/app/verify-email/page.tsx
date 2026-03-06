"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import { ApiError } from "@/lib/api/ApiError";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is missing a token.");
      return;
    }

    const verify = async () => {
      try {
        await api.post(
          "/auth/verify-email",
          { token },
          { withCredentials: false },
        );

        setStatus("success");
        setMessage("Your email has been verified. You can now log in.");
      } catch (err: unknown) {
        setStatus("error");

        if (err instanceof ApiError) {
          setMessage(
            err.data?.message ||
              "Verification failed. The link may be expired or already used.",
          );
        } else {
          setMessage(
            "Verification failed. The link may be expired or already used.",
          );
        }
      }
    };

    verify();
  }, [token]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="rounded-2xl border border-base-300 bg-card shadow-sm p-8 space-y-4">
        <h1 className="text-2xl font-bold">Verify Email</h1>

        {status === "loading" && (
          <p className="text-muted-foreground">Verifying your email...</p>
        )}

        {status === "success" && (
          <p className="text-emerald-600 font-medium">{message}</p>
        )}

        {status === "error" && (
          <p className="text-red-500 font-medium">{message}</p>
        )}

        <div className="pt-4 flex gap-3">
          <button
            className="btn btn-primary"
            onClick={() => router.push("/auth/login")}
          >
            Go to Login
          </button>

          <button className="btn btn-ghost" onClick={() => router.push("/")}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
