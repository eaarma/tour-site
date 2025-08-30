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
  remainingParticipants: number;
}

export interface TourScheduleUpdateDto {
  date?: string; // ISO string
  time?: string; // ISO time string
  maxParticipants?: number;
}
