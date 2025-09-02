"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/store/authSlice";
import { AuthService } from "@/lib/AuthService";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AuthService.getCurrentUser();
      if (user) {
        dispatch(setUser(user));
      } else {
        dispatch(clearUser());
      }
    };
    fetchUser();
  }, [dispatch]);

  return <>{children}</>;
}
