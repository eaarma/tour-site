import { CancellationReasonType } from "@/types/cancellation";
import api from "./api/axios";
import {
  OrderItemResponseDto,
  OrderResponseDto,
  OrderCreateRequestDto,
  OrderStatus,
} from "@/types/order";

const BASE_URL = "/orders";

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

interface AdminOrderParams {
  query?: string;
  status?: OrderStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const OrderService = {
  // 🔹 Fetch a specific order, filtered by guest or user
  getById: async (id: string, token?: string): Promise<OrderResponseDto> => {
    const url = token ? `/orders/${id}?token=${token}` : `/orders/${id}`;

    const res = await api.get(url);
    return res.data;
  },

  getOrderById: async (
    id: number,
    token?: string,
  ): Promise<OrderResponseDto> => {
    const url = token
      ? `${BASE_URL}/${id}?token=${token}`
      : `${BASE_URL}/${id}`;

    const res = await api.get(url, {
      withCredentials: false,
    });

    return res.data;
  },

  // 🔹 Create new order (auto-selects endpoint)
  create: async (
    data: OrderCreateRequestDto,
    isGuest: boolean = false,
  ): Promise<OrderResponseDto> => {
    const url = isGuest ? `${BASE_URL}/guest` : BASE_URL;
    const res = await api.post(url, data, {
      withCredentials: !isGuest, // only send cookies/tokens if logged in
    });
    return res.data;
  },

  // 🔹 Update entire order (rare)
  update: async (
    id: string,
    data: OrderCreateRequestDto,
  ): Promise<OrderResponseDto> => {
    const res = await api.put(`${BASE_URL}/${id}`, data, {
      withCredentials: true,
    });
    return res.data;
  },

  // 🔹 Fetch a specific order item by ID
  getShopOrderItemById: async (
    itemId: number,
  ): Promise<OrderItemResponseDto> => {
    const res = await api.get(`${BASE_URL}/items/${itemId}`, {
      withCredentials: true,
    });
    return res.data;
  },

  // 🔹 Fetch all order items for a specific shop
  getItemsByShopId: async (shopId: number): Promise<OrderItemResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}/items`, {
      withCredentials: true,
    });
    return res.data;
  },

  // 🔹 Fetch order items assigned to a specific manager
  getItemsByManagerId: async (
    managerId: string,
  ): Promise<OrderItemResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/manager/${managerId}/items`, {
      withCredentials: true,
    });
    return res.data;
  },

  // 🔹 Update item status
  updateItemStatus: async (
    itemId: number,
    status:
      | "CONFIRMED"
      | "CANCELLED_CONFIRMED"
      | "CANCELLED"
      | "PENDING"
      | "COMPLETED",
  ): Promise<OrderItemResponseDto> => {
    const res = await api.patch(
      `${BASE_URL}/items/${itemId}/status`,
      { status },
      { withCredentials: true },
    );
    return res.data;
  },

  // 🔹 Assign/reassign to manager
  reassignManager: async (
    itemId: number,
    managerId: string | null,
  ): Promise<OrderItemResponseDto> => {
    const res = await api.patch(
      `${BASE_URL}/items/${itemId}/assign`,
      { managerId },
      { withCredentials: true },
    );
    return res.data;
  },

  // 🔹 Confirm & assign in one step
  confirmOrderItem: async (
    itemId: number,
    managerId: string,
  ): Promise<OrderItemResponseDto> => {
    const res = await api.patch(
      `${BASE_URL}/items/${itemId}/confirm/${managerId}`,
      {},
      { withCredentials: true },
    );
    return res.data;
  },

  // 🔹 Fetch items for a user
  getOrderItemsByUserId: async (userId: string) => {
    const res = await api.get(`${BASE_URL}/user/${userId}/items`, {
      withCredentials: true,
    });
    return res.data as OrderItemResponseDto[];
  },

  cancelOrderItem: async (
    itemId: number,
    reasonType: CancellationReasonType,
    reason?: string,
  ) => {
    const res = await api.post(`/orders/items/${itemId}/cancel`, {
      reasonType,
      reason,
    });
    return res.data;
  },

  getAdminPage: async (
    params?: AdminOrderParams,
  ): Promise<PageResponse<OrderResponseDto>> => {
    const res = await api.get(`${BASE_URL}/admin`, {
      params,
      withCredentials: true,
    });

    return res.data;
  },
};
