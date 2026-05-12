import { notFound } from "next/navigation";

import { serverFetch } from "@/lib/server/serverApi";
import type { Tour } from "@/types";
import type { TourScheduleResponseDto } from "@/types/tourSchedule";

export type ItemPageServerData = {
  item: Tour;
  schedules: TourScheduleResponseDto[];
};

export async function getItemPageServerData(
  itemId: string,
): Promise<ItemPageServerData> {
  const numericItemId = Number(itemId);

  if (!Number.isFinite(numericItemId) || numericItemId <= 0) {
    notFound();
  }

  try {
    const [item, schedules] = await Promise.all([
      serverFetch<Tour>(`/tours/${numericItemId}`),
      serverFetch<TourScheduleResponseDto[]>(
        `/schedules/tour/${numericItemId}`,
      ).catch(() => []),
    ]);

    return {
      item,
      schedules,
    };
  } catch {
    notFound();
  }
}
