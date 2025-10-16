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
  id: string; // UUID
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  nationality?: string | null;
  bio?: string | null;
  experience?: string | null;
  languages?: string | null;
  createdAt?: string; // ISO date string
}

export interface UserUpdateDto {
  name?: string;
  phone?: string;
  nationality?: string;
  bio?: string;
  experience?: string;
  languages?: string;
}
