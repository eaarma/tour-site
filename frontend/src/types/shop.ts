// For Shop creation
export interface ShopCreateRequestDto {
  name: string;
  description?: string;
}

// For full Shop details
export interface ShopDto {
  id: number;
  name: string;
  description?: string;
}

// For user requesting to join a shop
export interface ShopJoinRequestDto {
  shopId: number;
  message?: string;
}

// For user assigned to a shop
export interface ShopUserDto {
  userId: string;
  userEmail: string;
  userName: string;
  phone: string;
  role: string;
  status: string;
  joinedAt: string; // ISO string
}

// For user-shop membership status
export interface ShopUserStatusDto {
  shopId: number;
  shopName: string;
  role: string;
  status: string;
  joinedAt: string; // ISO string (convert from LocalDateTime)
}
