'use client';

import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  User,
  getAuthMe,
  login as loginApi,
  register as registerApi,
  loginOAuth as loginOAuthApi,
  logout as logoutApi,
  LoginPayload,
  RegisterPayload,
  OAuthPayload,
} from '@/services/auth';
import { setStoredSessionToken } from '@/services/http';
import { queryKeys } from '@/services/query-keys';
import { ApiError } from '@/services/errors';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload | string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginOAuth: (provider: string, payload: OAuthPayload) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  isSubmitting: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) => getAuthMe(signal),
    retry: false,
    staleTime: 1000 * 60 * 15,
  });

  const isAuthenticated = Boolean(data?.authenticated) && !isError;
  const user = data?.user || null;

  const handlePostAuthSuccess = async () => {
    const me = await getAuthMe();
    if (me?.authenticated) {
      setAuthError(null);
      queryClient.setQueryData(queryKeys.auth.me(), me);
      router.push('/dashboard');
    } else {
      setStoredSessionToken(null);
      queryClient.setQueryData(queryKeys.auth.me(), { authenticated: false });
      setAuthError("Session could not be verified. Please ensure cookies are allowed.");
    }
  };

  const handleLogin = async (payload: LoginPayload | string) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await loginApi(payload);
      if (res.token) {
        setStoredSessionToken(res.token);
      }
      await handlePostAuthSuccess();
    } catch (err: unknown) {
      setStoredSessionToken(null);
      queryClient.setQueryData(queryKeys.auth.me(), { authenticated: false });
      const apiErr = err as ApiError;
      setAuthError(apiErr?.message || "Invalid authentication credentials. Please try again.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (payload: RegisterPayload) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await registerApi(payload);
      if (res.token) {
        setStoredSessionToken(res.token);
      }
      await handlePostAuthSuccess();
    } catch (err: unknown) {
      setStoredSessionToken(null);
      queryClient.setQueryData(queryKeys.auth.me(), { authenticated: false });
      const apiErr = err as ApiError;
      setAuthError(apiErr?.message || "Registration failed. Please try again.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: string, payload: OAuthPayload) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await loginOAuthApi(provider, payload);
      if (res.token) {
        setStoredSessionToken(res.token);
      }
      await handlePostAuthSuccess();
    } catch (err: unknown) {
      setStoredSessionToken(null);
      queryClient.setQueryData(queryKeys.auth.me(), { authenticated: false });
      const apiErr = err as ApiError;
      setAuthError(apiErr?.message || `${provider} login failed. Please try again.`);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Continue cleanup even if server unreachable
    } finally {
      setStoredSessionToken(null);
      setAuthError(null);
      queryClient.clear();
      queryClient.setQueryData(queryKeys.auth.me(), { authenticated: false });
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        loginOAuth: handleOAuthLogin,
        logout: handleLogout,
        authError,
        setAuthError,
        isSubmitting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
