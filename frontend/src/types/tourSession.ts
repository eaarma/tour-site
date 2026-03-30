import { OrderItemResponseDto, OrderStatus } from "./order";

export type SessionStatus =
  | "PENDING"
  | "EXPIRED"
  | "PLANNED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "CONFIRMED"
  | "PARTIALLY_CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "COMPLETED"
  | "CANCELLED"
  | "CANCELLED_CONFIRMED"
  | "FAILED";

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

  maxParticipants: number;
  bookedParticipants: number;
  remaining: number;
  tourImages?: string[];

  participants: OrderItemResponseDto[];

  status: SessionStatus;
  managerId: string | undefined;
  managerName: string | undefined;
  managerEmail: string;
  managerRole: string;
}
