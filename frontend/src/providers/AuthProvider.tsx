"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/store/authSlice";
import { AuthService } from "@/lib/authService";
import { UserResponseDto } from "@/types";
import { useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  // 🔹 1. Load user on first page render (your original logic)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user: UserResponseDto | null = await AuthService.getCurrentUser();
        if (user) {
          dispatch(setUser(user));
        } else {
          dispatch(clearUser());
        }
      } catch {
        dispatch(clearUser());
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  // 🔹 2. Background session checker (added)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Try to validate access token
        await AuthService.getCurrentUser();
      } catch {
        // Token invalid → attempt refresh
        try {
          await AuthService.refresh();
          await AuthService.getCurrentUser();
        } catch {
          // Refresh failed → session expired
          dispatch(clearUser());
          router.push("/auth/login?sessionExpired=1");
        }
      }
    }, 60000); // check every 60 seconds

    return () => clearInterval(interval);
  }, [dispatch, router]);

  if (loading) {
    return <div className="p-6 text-center">Loading authentication...</div>;
  }

  return <>{children}</>;
}
