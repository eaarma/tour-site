import api from "@/lib/axios";
import {
  UserResponseDto,
  ManagerRegisterRequestDto,
  UserRegisterRequestDto,
  LoginRequestDto,
} from "@/types/user";

export const AuthService = {
  registerUser: async (
    data: UserRegisterRequestDto
  ): Promise<UserResponseDto> => {
    const res = await api.post("/auth/register/user", data);
    return res.data;
  },

  registerManager: async (
    data: ManagerRegisterRequestDto
  ): Promise<UserResponseDto> => {
    const res = await api.post("/auth/register/manager", data);
    return res.data;
  },

  login: async (data: LoginRequestDto): Promise<UserResponseDto> => {
    const res = await api.post("/auth/login", data);
    // ⚠️ Cookie is set automatically because of withCredentials:true
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    // Backend deletes the cookie
  },

  refresh: async (refreshToken: string) => {
    const res = await api.post("/auth/refresh", { refreshToken });
    return res.data; // contains new token + user
  },

  // 🔑 This one is missing in your code
  getCurrentUser: async (): Promise<UserResponseDto | null> => {
    try {
      const res = await api.get("/auth/me"); // backend validates cookie
      return res.data;
    } catch {
      return null;
    }
  },
};
