import { UserResponseDto } from "./user"; // adjust path as needed

export interface JwtResponseDto {
  token: string;
  refreshToken: string;
  user: UserResponseDto;
}
