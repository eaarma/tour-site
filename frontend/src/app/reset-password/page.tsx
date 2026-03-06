"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api/axios";
import { ApiError } from "@/lib/api/ApiError";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Reset link is missing a token.");
    }
  }, [token]);

  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    if (!passwordValid) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(
        "/auth/password/reset",
        {
          token,
          newPassword: password,
        },
        { withCredentials: false },
      );

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");

      if (err instanceof ApiError) {
        setError(err.data?.message || err.message);
      } else {
        setError("Password reset failed. The link may be invalid or expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-24 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="card bg-base-100 p-8 rounded-xl border border-base-300 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your password has been successfully reset.
              </p>

              <button
                className="btn btn-primary w-full"
                onClick={() => router.push("/auth/login")}
              >
                Go to Login
              </button>
            </div>
          )}

          {status === "form" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="New Password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input input-bordered w-full"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {confirmPassword.length > 0 && (
                  <p
                    className={`text-xs ${
                      passwordsMatch ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                type="submit"
                disabled={loading || !passwordValid || !passwordsMatch}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <p className="text-error text-sm">
                {error ||
                  "Password reset failed. The link may be invalid or expired."}
              </p>

              <button
                className="btn btn-outline w-full"
                onClick={() => router.push("/auth/forgot-password")}
              >
                Request New Reset Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
