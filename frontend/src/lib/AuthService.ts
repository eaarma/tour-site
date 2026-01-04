import api from "@/lib/api/axios";
import {
  UserResponseDto,
  ManagerRegisterRequestDto,
  UserRegisterRequestDto,
  LoginRequestDto,
} from "@/types/user";
import { AuthResponseDto, RefreshResponseDto } from "@/types/auth";

export const AuthService = {
  // ===============================
  // Registration
  // ===============================
  registerUser: async (
    data: UserRegisterRequestDto
  ): Promise<UserResponseDto> => {
    const res = await api.post("/auth/register/user", data, {
      withCredentials: false,
    });
    return res.data;
  },

  registerManager: async (
    data: ManagerRegisterRequestDto
  ): Promise<UserResponseDto> => {
    const res = await api.post("/auth/register/manager", data, {
      withCredentials: false,
    });
    return res.data;
  },

  // ===============================
  // Authentication
  // ===============================
  login: async (data: LoginRequestDto): Promise<AuthResponseDto> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  // ===============================
  // Token refresh
  // ===============================
  refresh: async (): Promise<RefreshResponseDto> => {
    const res = await api.post("/auth/refresh");
    return res.data;
  },

  // ===============================
  // Session
  // ===============================
  getCurrentUser: async (): Promise<UserResponseDto | null> => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch {
      return null;
    }
  },
};
