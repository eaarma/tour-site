import api from "@/lib/axios"; // for authenticated requests
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

  login: async (data: LoginRequestDto): Promise<UserResponseDto> => {
    const res = await api.post("/auth/login", data);
    // With credentials: true to receive JWT cookie
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  refresh: async (refreshToken: string) => {
    const res = await api.post("/auth/refresh", { refreshToken });
    return res.data;
  },

  getCurrentUser: async (): Promise<UserResponseDto | null> => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch {
      return null;
    }
  },
};
