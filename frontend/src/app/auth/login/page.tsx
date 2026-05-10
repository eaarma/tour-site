"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import AuthPageShell from "@/components/auth/AuthPageShell";
import { AuthService } from "@/lib/auth/authService";
import api from "@/lib/api/axios";
import { ApiError } from "@/lib/api/ApiError";
import { clearUser, setAuth } from "@/store/authSlice";
import { clearExpired } from "@/store/sessionSlice";
import { RootState } from "@/store/store";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;

    const expired = searchParams.get("sessionExpired");
    if (expired === "1") {
      toastShown.current = true;
      toast.error("Your session has expired. Please log in again.");
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  const loggedInRedirect = useMemo(() => {
    if (!user) return "/";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "MANAGER") return "/shops";
    return "/user";
  }, [user]);

  const handleLogout = async () => {
    dispatch(clearUser());

    try {
      await api.post("/auth/logout");
      dispatch(clearExpired());
      dispatch(clearUser());
    } finally {
      if (pathname?.startsWith("/user") || pathname?.startsWith("/manager")) {
        router.push("/");
      } else {
        router.refresh();
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Enter your email to resend verification.");
      return;
    }

    try {
      await api.post(
        "/auth/resend-verification",
        { email },
        { withCredentials: false },
      );

      toast.success("Verification email sent.");
    } catch {
      toast.error("Failed to resend verification email.");
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const { accessToken, user: authenticatedUser } = await AuthService.login({
        email,
        password,
      });

      dispatch(setAuth({ user: authenticatedUser, accessToken }));
      dispatch(clearExpired());

      let redirect = "/user";

      if (authenticatedUser.role === "ADMIN") {
        redirect = "/admin";
      } else if (authenticatedUser.role === "MANAGER") {
        redirect = "/shops";
      }

      router.push(redirect);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const message = err.data?.message || err.message;

        setError(message);

        if (message.toLowerCase().includes("verify")) {
          setNeedsVerification(true);
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <AuthPageShell
        formEyebrow="Signed In"
        formTitle="You are already logged in"
        formDescription="You already have an active session. You can continue to your dashboard, return home, or log out from here."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-base-content/70">
            Signed in as{" "}
            <span className="font-semibold text-base-content">
              {user.email}
            </span>
            .
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="btn btn-primary h-12 w-full"
              onClick={() => router.push(loggedInRedirect)}
            >
              Continue to Dashboard
            </button>
            <button
              className="btn btn-outline h-12 w-full"
              onClick={handleLogout}
            >
              Log Out
            </button>
            <button
              className="btn btn-ghost h-12 w-full"
              onClick={() => router.push("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      formEyebrow="Welcome Back"
      formTitle="Sign in to your account"
      formDescription="Access your bookings, profile tools, and role-based dashboard from one secure sign-in."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content/80">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered h-12 w-full bg-base-100"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setNeedsVerification(false);
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-base-content/80">
              Password
            </label>
          </div>
          <input
            type="password"
            placeholder="Enter your password"
            className="input input-bordered h-12 w-full bg-base-100"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/forgot-password")}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-error/20 bg-error/5 p-4 text-sm leading-6 text-error">
            {error}
          </div>
        )}

        {needsVerification && (
          <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm leading-6 text-base-content/70">
            Your account still needs verification before login.
            <button
              type="button"
              onClick={handleResendVerification}
              className="mt-3 block font-medium text-primary hover:underline"
            >
              Resend verification email
            </button>
          </div>
        )}

        <button
          className="btn btn-primary h-12 w-full text-base"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          className="btn btn-outline h-12 w-full"
          onClick={() => router.push("/auth/register/user")}
        >
          Create User Account
        </button>
        <button
          className="btn btn-outline h-12 w-full"
          onClick={() => router.push("/auth/register/manager")}
        >
          Become a Tour Guide
        </button>
      </div>
    </AuthPageShell>
  );
}

