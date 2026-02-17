import { TourScheduleService } from "@/lib/tourScheduleService";
import { CartItem } from "@/types";

export async function validateSchedulesAgainstCapacity(
  items: CartItem[],
): Promise<{
  ok: boolean;
  issues: {
    scheduleId: number;
    available: number;
    requested: number;
    items: CartItem[];
  }[];
}> {
  const issues: {
    scheduleId: number;
    available: number;
    requested: number;
    items: CartItem[];
  }[] = [];

  const grouped = new Map<number, CartItem[]>();

  // 🔹 Group by schedule
  for (const item of items) {
    if (!grouped.has(item.scheduleId)) {
      grouped.set(item.scheduleId, []);
    }
    grouped.get(item.scheduleId)!.push(item);
  }

  for (const [scheduleId, group] of grouped.entries()) {
    try {
      const schedule = await TourScheduleService.getById(scheduleId);

      // ❌ Schedule missing or inactive
      if (!schedule || schedule.status !== "ACTIVE") {
        issues.push({
          scheduleId,
          available: 0,
          requested: group.reduce((sum, i) => sum + i.participants, 0),
          items: group,
        });
        continue;
      }

      // ✅ CORRECT availability calculation
      const available =
        (schedule.maxParticipants ?? 0) -
        (schedule.bookedParticipants ?? 0) -
        (schedule.reservedParticipants ?? 0);

      const requested = group.reduce((sum, i) => sum + i.participants, 0);

      if (requested > available) {
        issues.push({
          scheduleId,
          available: Math.max(0, available),
          requested,
          items: group,
        });
      }
    } catch {
      issues.push({
        scheduleId,
        available: 0,
        requested: group.reduce((sum, i) => sum + i.participants, 0),
        items: group,
      });
    }
  }

  return { ok: issues.length === 0, issues };
}
