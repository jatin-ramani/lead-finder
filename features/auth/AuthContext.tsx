'use client';

import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAuthMe, login as loginApi, logout as logoutApi } from '@/services/auth';
import { setStoredSessionToken } from '@/services/http';
import { queryKeys } from '@/services/query-keys';
import { ApiError } from '@/services/errors';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (secret: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
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

  const handleLogin = async (secret: string) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      // 1. Post login secret
      const res = await loginApi(secret);
      if (res.token) {
        setStoredSessionToken(res.token);
      }

      // 2. Authoritative verification via /auth/me before assuming authentication
      const me = await getAuthMe();
      if (me?.authenticated) {
        setAuthError(null);
        queryClient.setQueryData(queryKeys.auth.me(), { authenticated: true });
        router.push('/');
      } else {
        setStoredSessionToken(null);
        queryClient.setQueryData(queryKeys.auth.me(), { authenticated: false });
        setAuthError("Session could not be verified. Please ensure cookies are allowed.");
      }
    } catch (err: unknown) {
      setStoredSessionToken(null);
      queryClient.setQueryData(queryKeys.auth.me(), { authenticated: false });
      const apiErr = err as ApiError;
      setAuthError(apiErr?.message || "Invalid authentication credentials. Please try again.");
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
        isAuthenticated,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        authError,
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
