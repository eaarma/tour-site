"use client";

import RequireAuth from "@/components/common/RequireAuth";
import { UserPageContent } from "@/components/user/UserPageContent";
export default function UserPage() {
  return (
    <RequireAuth>
      <UserPageContent />
    </RequireAuth>
  );
}
