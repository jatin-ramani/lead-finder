import { get, post } from "./http";

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface AuthMeResponse {
  authenticated: boolean;
}

export function login(secret: string): Promise<LoginResponse> {
  return post<LoginResponse>("/auth/login", { secret });
}

export function logout(): Promise<LoginResponse> {
  return post<LoginResponse>("/auth/logout");
}

export function getAuthMe(signal?: AbortSignal): Promise<AuthMeResponse> {
  return get<AuthMeResponse>("/auth/me", { signal });
}
