import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export function useAuth() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = !!user;
  const role = user?.role ?? null;

  return { user, isAuthenticated, role };
}
