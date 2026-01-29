"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearUser, setAuth } from "@/store/authSlice";
import { AuthService } from "@/lib/authService";
import { UserResponseDto } from "@/types";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // 1️⃣ Initial user load (NO accessToken here)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user: UserResponseDto | null = await AuthService.getCurrentUser();

        if (user) {
          // ⚠️ accessToken is intentionally null here
          dispatch(setAuth({ user, accessToken: null }));
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

  /*   // 2️⃣ Background session checker (optional but valid) Currently disabled
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await AuthService.getCurrentUser();
      } catch {
        try {
          const { accessToken } = await AuthService.refresh();
          dispatch(setAuth({ user: null, accessToken }));
          await AuthService.getCurrentUser();
        } catch {
          dispatch(clearUser());
          router.push("/auth/login?sessionExpired=1");
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, router]); */
  if (loading) {
    return <div className="p-6 text-center">Loading authentication...</div>;
  }

  return <>{children}</>;
}
