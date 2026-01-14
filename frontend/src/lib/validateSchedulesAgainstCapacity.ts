import { tourScheduleService } from "@/lib/tourScheduleService";
import { CartItem } from "@/types";

export async function validateSchedulesAgainstCapacity(
  items: CartItem[]
): Promise<{ ok: boolean; badItems: CartItem[] }> {
  const bad: CartItem[] = [];

  const grouped = new Map<number, CartItem[]>();

  for (const item of items) {
    if (!grouped.has(item.scheduleId)) {
      grouped.set(item.scheduleId, []);
    }
    grouped.get(item.scheduleId)!.push(item);
  }

  for (const [scheduleId, group] of grouped.entries()) {
    try {
      const schedule = await tourScheduleService.getById(scheduleId);

      if (!schedule || schedule.status !== "ACTIVE") {
        bad.push(...group);
        continue;
      }

      const remaining = schedule.maxParticipants - schedule.bookedParticipants;

      const requested = group.reduce((sum, i) => sum + i.participants, 0);

      if (requested > remaining) {
        bad.push(...group);
      }
    } catch {
      bad.push(...group);
    }
  }

  return { ok: bad.length === 0, badItems: bad };
}
