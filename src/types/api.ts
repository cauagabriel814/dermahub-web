export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  role: "admin" | "secretary";
}
