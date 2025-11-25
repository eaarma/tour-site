"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/lib/authService";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import toast from "react-hot-toast";

const redirectByRole = (role: string) => {
  switch (role) {
    case "ADMIN":
    case "MANAGER":
      return "/shops";
    case "USER":
    default:
      return "/user";
  }
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const toastShown = useRef(false);

  // 🔹 Show toast if redirected from expired session
  useEffect(() => {
    if (toastShown.current) return;

    const expired = searchParams.get("sessionExpired");
    if (expired === "1") {
      toastShown.current = true;
      toast.error("Your session has expired. Please log in again.");

      // Remove query param after showing toast
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await AuthService.login({ email, password });
      dispatch(setUser(user));
      router.push(redirectByRole(user.role));
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen pt-24 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* User login card */}
        <div className="card shadow-lg bg-base-300 p-8">
          <h2 className="text-2xl font-bold mb-4">User Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <div className="mt-4 text-sm text-center space-y-2">
            <div>
              Don’t have an account?{" "}
              <button
                className="link link-primary"
                onClick={() => router.push("/auth/register/user")}
              >
                Register
              </button>
            </div>

            <div className="divider text-xs">or</div>

            <div>
              Want to share your expertise?{" "}
              <button
                className="link link-secondary"
                onClick={() => router.push("/auth/register/manager")}
              >
                Become a Tour Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
