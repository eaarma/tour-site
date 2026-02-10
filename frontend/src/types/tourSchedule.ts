export interface TourScheduleCreateDto {
  tourId: number;
  date: string; // ISO string
  time?: string; // ISO time string
  maxParticipants: number;
}

export interface TourScheduleResponseDto {
  id: number;
  tourId: number;
  date: string;
  time?: string;
  maxParticipants: number;
  bookedParticipants: number;
  reservedParticipants: number; // ← add this
  status?: "ACTIVE" | "BOOKED" | "CANCELLED";
  type?: "PUBLIC" | "PRIVATE";
}

export interface TourScheduleUpdateDto {
  date?: string;
  time?: string;
  maxParticipants?: number;
  bookedParticipants?: number; // ✅
  status?: string; // ✅
}
