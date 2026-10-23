import { get, post } from "./http";

export interface User {
  id: number;
  email: string;
  full_name?: string;
  avatar_url?: string;
  provider: string;
  role: string;
  created_at?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface AuthMeResponse {
  authenticated: boolean;
  user?: User;
}

export interface LoginPayload {
  email?: string;
  password?: string;
  secret?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface OAuthPayload {
  provider: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider_id?: string;
  id_token?: string;
}

export function login(payload: LoginPayload | string): Promise<LoginResponse> {
  const body = typeof payload === "string" ? { secret: payload } : payload;
  return post<LoginResponse>("/auth/login", body);
}

export function register(payload: RegisterPayload): Promise<LoginResponse> {
  return post<LoginResponse>("/auth/register", payload);
}

export function loginOAuth(provider: string, payload: OAuthPayload): Promise<LoginResponse> {
  return post<LoginResponse>(`/auth/oauth/${provider.toLowerCase()}`, payload);
}

export function logout(): Promise<LoginResponse> {
  return post<LoginResponse>("/auth/logout");
}

export function getAuthMe(signal?: AbortSignal): Promise<AuthMeResponse> {
  return get<AuthMeResponse>("/auth/me", { signal });
}
