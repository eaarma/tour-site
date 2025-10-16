"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/store/authSlice";
import { AuthService } from "@/lib/authService";
import { UserResponseDto } from "@/types";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-6 text-center">Loading authentication...</div>;
  }

  return <>{children}</>;
}
