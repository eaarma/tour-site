"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import { ApiError } from "@/lib/api/ApiError";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      await api.post(
        "/auth/password/forgot",
        { email },
        { withCredentials: false },
      );

      setSent(true);

      toast.success("If an account exists, a reset email has been sent.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.data?.message || err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-24 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="card bg-base-100 p-8 rounded-xl border border-base-300 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Password Recovery</h2>

          {sent ? (
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                If an account exists for this email, a password reset link has
                been sent.
              </p>

              <button
                className="btn btn-primary w-full mt-4"
                onClick={() => router.push("/auth/login")}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {error && <p className="text-error text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
