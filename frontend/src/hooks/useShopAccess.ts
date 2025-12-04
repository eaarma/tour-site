import { ShopUserService } from "@/lib/shopUserService";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";

export function useShopAccess(shopId: number) {
  const user = useAppSelector((state) => state.auth.user);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setAllowed(false);
      return;
    }

    ShopUserService.getMembership(shopId)
      .then((res) => {
        // res: { member: boolean, role: string | null, status: "ACTIVE" | "PENDING" | "REJECTED" }

        if (!res.member) {
          setAllowed(false);
          return;
        }

        if (res.status !== "ACTIVE") {
          // Pending or rejected
          setAllowed(false);
          return;
        }

        // Membership active
        setAllowed(true);
      })
      .catch(() => {
        setAllowed(false);
      });
  }, [shopId, user]);

  return allowed; // null = loading
}
