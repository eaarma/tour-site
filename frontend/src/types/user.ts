// For admin registration
export interface ManagerRegisterRequestDto {
  email: string;
  password: string;
  name: string;
  phone: string;
  nationality: string;
  experience: string;
  languages: string;
  bio: string;
}

// For user registration
export interface UserRegisterRequestDto {
  email: string;
  password: string;
  name: string;
  phone: string;
  nationality: string;
}

// For login
export interface LoginRequestDto {
  email: string;
  password: string;
}

// Response received for authenticated user
export interface UserResponseDto {
  id: string; // UUID as string
  name: string;
  email: string;
  role: string;
}
