"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/lib/authService";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setAuth } from "@/store/authSlice";
import toast from "react-hot-toast";
import api from "@/lib/api/axios";
import { RootState } from "@/store/store";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const user = useSelector((state: RootState) => state.auth.user); // <-- logged-in check

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toastShown = useRef(false);
  const pathname = usePathname();

  // Redirect toast
  useEffect(() => {
    if (toastShown.current) return;

    const expired = searchParams.get("sessionExpired");
    if (expired === "1") {
      toastShown.current = true;
      toast.error("Your session has expired. Please log in again.");
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  const handleLogout = async () => {
    dispatch(clearUser());

    try {
      await api.post("/auth/logout");
    } finally {
      if (pathname?.startsWith("/user") || pathname?.startsWith("/manager")) {
        router.push("/");
      } else {
        router.refresh();
      }
    }
  };

  // 🔹 If already logged in → show message instead of login form
  if (user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="card bg-base-300 shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold">You are already logged in</h2>
          <p className="opacity-80">
            Log out or navigate back to the home page.
          </p>

          <div className="flex flex-col gap-3 mt-4">
            <button className="btn btn-error" onClick={() => handleLogout()}>
              Log Out
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Normal login flow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { accessToken, user } = await AuthService.login({
        email,
        password,
      });

      dispatch(setAuth({ user, accessToken }));

      const redirect =
        user.role === "ADMIN" || user.role === "MANAGER" ? "/shops" : "/user";

      router.push(redirect);
    } catch (err) {
      setError("Invalid email or password: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen pt-24 px-4">
      <div className="w-full max-w-md space-y-8">
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

          {/* 👇 Add these */}
          <div className="mt-10 flex flex-col gap-3">
            <button
              className="btn btn-outline w-full"
              onClick={() => router.push("/auth/register/user")}
            >
              Register
            </button>

            <button
              className="btn btn-outline w-full"
              onClick={() => router.push("/auth/register/manager")}
            >
              Become a tour guide
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
