import api from "./axios";
import {
  OrderItemResponseDto,
  OrderResponseDto,
  OrderCreateRequestDto,
} from "@/types/order";

const BASE_URL = "/orders";

export const OrderService = {
  // 🔹 Fetch a specific order
  getById: async (id: string): Promise<OrderResponseDto> => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  // 🔹 Create new order
  create: async (data: OrderCreateRequestDto): Promise<OrderResponseDto> => {
    const res = await api.post(BASE_URL, data);
    return res.data;
  },

  // 🔹 Update entire order (if ever needed)
  update: async (
    id: string,
    data: OrderCreateRequestDto
  ): Promise<OrderResponseDto> => {
    const res = await api.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  // 🔹 Fetch a specific order item by ID
  getOrderItemById: async (itemId: number): Promise<OrderItemResponseDto> => {
    const res = await api.get(`${BASE_URL}/items/${itemId}`);
    return res.data;
  },

  // 🔹 Fetch all order items for a specific shop
  getItemsByShopId: async (shopId: number): Promise<OrderItemResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/shop/${shopId}/items`);
    return res.data;
  },

  // 🔹 Fetch order items assigned to a specific manager
  getItemsByManagerId: async (
    managerId: string
  ): Promise<OrderItemResponseDto[]> => {
    const res = await api.get(`${BASE_URL}/manager/${managerId}/items`);
    return res.data;
  },

  // 🔹 Update item status (Pending → Completed, etc.)
  updateItemStatus: async (
    itemId: number,
    status:
      | "CONFIRMED"
      | "CANCELLED_CONFIRMED"
      | "CANCELLED"
      | "PENDING"
      | "COMPLETED"
  ): Promise<OrderItemResponseDto> => {
    const res = await api.patch(`${BASE_URL}/items/${itemId}/status`, {
      status,
    });
    return res.data;
  },

  // 🔹 Assign or reassign an order item to a manager
  // send managerId in the request body (can be null)
  reassignManager: async (
    itemId: number,
    managerId: string | null
  ): Promise<OrderItemResponseDto> => {
    const res = await api.patch(`${BASE_URL}/items/${itemId}/assign`, {
      managerId,
    });
    return res.data;
  },

  // 🔹 Confirm and assign order to manager in one action
  confirmOrderItem: async (
    itemId: number,
    managerId: string
  ): Promise<OrderItemResponseDto> => {
    const res = await api.patch(
      `${BASE_URL}/items/${itemId}/confirm/${managerId}`
    );
    return res.data;
  },

  getOrderItemsByUserId: async (userId: string) => {
    const res = await api.get(`/orders/user/${userId}/items`, {
      withCredentials: true,
    });
    return res.data as OrderItemResponseDto[];
  },
};
