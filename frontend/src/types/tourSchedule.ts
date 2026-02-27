export interface TourScheduleCreateDto {
  tourId: number;
  date: string; // ISO string
  time?: string; // ISO time string
}

export interface TourScheduleResponseDto {
  id: number;
  tourId: number;
  date: string;
  time?: string;
  tourTitle: string;
  maxParticipants: number;
  bookedParticipants: number;
  reservedParticipants: number;
  status: "ACTIVE" | "BOOKED" | "CANCELLED" | "EXPIRED";
  type?: "PUBLIC" | "PRIVATE";
}

export interface TourScheduleUpdateDto {
  date?: string;
  time?: string;
  maxParticipants?: number;
  bookedParticipants?: number; // ✅
  status?: string; // ✅
}
