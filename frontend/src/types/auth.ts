import { UserResponseDto } from "./user";

export interface AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}

export interface RefreshResponseDto {
  accessToken: string;
}
