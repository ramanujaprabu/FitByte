/**
 * FitByte — Auth context.
 * Tracks the Supabase session and exposes login/register/logout to the app.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { authService, type LoginCredentials, type RegisterCredentials } from '@/services/api/auth';
import { offlineStorage } from '@/lib/offline-storage';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRecoverySession: boolean;
  setIsRecoverySession: (val: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPasswordForEmail: (email: string, redirectTo?: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendVerificationEmail: (email: string, redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  const refreshUser = useCallback(async () => {
    const current = await authService.getCurrentUser();
    setUser(current);
  }, []);

  useEffect(() => {
    offlineStorage.purgeLegacyGlobalKeys();
    refreshUser().finally(() => setIsLoading(false));

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true);
      }
      if (!session) {
        setUser(null);
      } else {
        refreshUser();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loggedIn = await authService.login(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const registered = await authService.register(credentials);
    // Note: If email verification is enabled, user may need to verify before full session
    return registered;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsRecoverySession(false);
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string, redirectTo?: string) => {
    await authService.resetPasswordForEmail(email, redirectTo);
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    await authService.updatePassword(password);
    setIsRecoverySession(false);
  }, []);

  const resendVerificationEmail = useCallback(async (email: string, redirectTo?: string) => {
    await authService.resendVerificationEmail(email, redirectTo);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isRecoverySession,
        setIsRecoverySession,
        login,
        register,
        logout,
        refreshUser,
        resetPasswordForEmail,
        updatePassword,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
