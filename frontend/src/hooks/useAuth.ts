import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Role } from "@/types";

export function useAuth() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = !!user;

  const role: Role | null = user?.role ?? null;

  return { user, isAuthenticated, role };
}
