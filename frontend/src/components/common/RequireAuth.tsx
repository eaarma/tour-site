"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "MANAGER";
}

export default function RequireAuth({
  children,
  requiredRole,
}: RequireAuthProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  if (!user) {
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

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>
          You need to be logged in as a {requiredRole.toLowerCase()} to view
          this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
