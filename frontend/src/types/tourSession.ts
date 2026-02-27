import { OrderItemResponseDto, OrderStatus } from "./order";

export type SessionStatus =
  | "PLANNED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "CANCELLED_CONFIRMED";

export interface OrderItemParticipantDto {
  orderItemId: number;
  name: string;
  participants: number;
  status: OrderStatus;

  pricePaid: number;

  managerId: string | undefined;
  managerName: string | undefined;

  email: string;
  phone: string;
  nationality: string | null;
}

export interface TourSessionDto {
  id: number;
  tourId: number;
  scheduleId: number;

  date: string;
  time: string;
  tourTitle: string;
  tourLocation?: string;
  tourMeetingPoint: string;
  shopId: number;

  maxParticipants: number; // ✅ renamed
  bookedParticipants: number;
  remaining: number;
  tourImages?: string[];

  participants: OrderItemResponseDto[];

  status:
    | "PLANNED"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "CANCELLED_CONFIRMED";
  managerId: string | undefined;
  managerName: string | undefined;
}
