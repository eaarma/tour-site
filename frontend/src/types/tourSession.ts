import { OrderStatus } from "./order";

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

  date: string;
  time: string;

  capacity: number;
  remaining: number;

  participants: OrderItemParticipantDto[];

  status:
    | "PLANNED"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "CANCELLED_CONFIRMED";
  managerId: string | undefined;
  managerName: string | undefined;
}
