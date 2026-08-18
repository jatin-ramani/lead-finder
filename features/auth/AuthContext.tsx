'use client';

import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAuthMe, login as loginApi, logout as logoutApi } from '@/services/auth';
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

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) => getAuthMe(signal),
    retry: false,
    staleTime: 1000 * 60 * 15,
  });

  const isAuthenticated = Boolean(data?.authenticated) && !isError;

  const loginMutation = useMutation({
    mutationFn: (secret: string) => loginApi(secret),
    onSuccess: () => {
      setAuthError(null);
      queryClient.setQueryData(queryKeys.auth.me(), { authenticated: true });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      router.push('/');
    },
    onError: (err: ApiError) => {
      setAuthError(err?.message || 'Invalid authentication credentials. Please try again.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      setAuthError(null);
      queryClient.clear();
      router.push('/login');
    },
  });

  const handleLogin = async (secret: string) => {
    setAuthError(null);
    await loginMutation.mutateAsync(secret);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        authError,
        isSubmitting: loginMutation.isPending,
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
