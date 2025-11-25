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
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  // You can keep this if you ever call refresh manually,
  // but axios.interceptor already does it automatically.
  refresh: async () => {
    const res = await api.post("/auth/refresh");
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
