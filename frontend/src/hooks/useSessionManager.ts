import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!shopId) return;
    reloadSessions();
  }, [shopId]);

  const reloadSessions = async () => {
    if (!shopId) return;
    const updated = await TourSessionService.getByShopId(shopId);
    const filtered = updated.filter(
      (s: TourSessionDto) => (s.participants?.length ?? 0) > 0,
    );
    setSessionList(filtered);
  };

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
