import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { TourSessionDto } from "@/types/tourSession";
import { TourSessionService } from "@/lib/tourSessionService";
import toast from "react-hot-toast";

export function useSessionManager(shopId: number) {
  const { user } = useAuth();
  const [sessionList, setSessionList] = useState<TourSessionDto[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );

  const reloadSessions = useCallback(async () => {
    if (!shopId) return;

    const sessions = await TourSessionService.getByShopId(shopId);

    const filtered = sessions.filter((s) => {
      const participants = s.participants ?? [];

      if (participants.length === 0) return false;

      if (s.status === "CANCELLED") return true;

      return participants.some(
        (p) => p.status !== "CANCELLED" && p.status !== "CANCELLED_CONFIRMED",
      );
    });

    setSessionList(filtered);
  }, [shopId]);

  const confirmSession = async (sessionId: number) => {
    if (!user?.id) return;

    await TourSessionService.assignManager(sessionId, user.id);
    await TourSessionService.updateStatus(sessionId, "CONFIRMED");
    toast.success("Session confirmed");
    await reloadSessions();
  };

  const completeSession = async (sessionId: number) => {
    await TourSessionService.updateStatus(sessionId, "COMPLETED");
    toast.success("Session marked as completed");
    await reloadSessions();
  };

  const updateLocalSession = (updated: TourSessionDto) => {
    setSessionList((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
  };

  useEffect(() => {
    reloadSessions();
  }, [reloadSessions]);

  return {
    sessionList,
    selectedSessionId,
    setSelectedSessionId,
    reloadSessions,
    confirmSession,
    completeSession,
    updateLocalSession,
  };
}
