export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  id: string;
  token: string;
  email: string;
  userName: string;
  nombre: string;
  roles: string[];
}
