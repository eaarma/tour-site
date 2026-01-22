"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useRoleGuard } from "@/hooks/userRoleGuard";
import { Role } from "@/types/user";
interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: Role | Role[];
}

export default function RequireAuth({
  children,
  requiredRole,
}: RequireAuthProps) {
  const { user, isAuthenticated, role } = useAuth();
  const router = useRouter();

  // Reuse guard hook for internal role consistency
  useRoleGuard(requiredRole);

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Not Authorized</h2>
        <p className="mb-6">You need to be logged in to view this page.</p>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/auth/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Role mismatch (supports single or multiple roles)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!role || !allowedRoles.includes(role)) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>
            You must be logged in as{" "}
            {allowedRoles.map((r) => r.toLowerCase()).join(" or ")} to view this
            page.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
