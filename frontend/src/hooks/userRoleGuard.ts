"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRoleGuard(requiredRoles?: string | string[]) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return; // UI handles unauth state separately
    if (!requiredRoles) return;

    const allowedRoles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];

    if (!allowedRoles.includes(role || "")) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, role, requiredRoles, router]);

  return { isAuthenticated, role };
}
