/**
 * FitByte — Auth Service
 *
 * Placeholder for authentication integration.
 * Replace the `Promise.resolve` calls with real API/SDK calls when backend is ready.
 *
 * Integrations to wire up:
 *   - Firebase Auth / Supabase Auth / custom JWT
 *   - OAuth providers (Google, Apple)
 *   - Token storage (expo-secure-store)
 */

import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Sign in with email/password.
   * @todo Replace with real API call: POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // TODO: implement real login
    return Promise.reject(new Error('Auth not implemented — connect backend'));
  },

  /**
   * Register a new user.
   * @todo Replace with real API call: POST /auth/register
   */
  async register(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // TODO: implement real registration
    return Promise.reject(new Error('Auth not implemented — connect backend'));
  },

  /**
   * Sign out and clear tokens.
   * @todo Clear expo-secure-store entries
   */
  async logout(): Promise<void> {
    // TODO: clear stored tokens
    return Promise.resolve();
  },

  /**
   * Refresh the access token.
   * @todo Replace with real API call: POST /auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return Promise.reject(new Error('Token refresh not implemented'));
  },

  /**
   * Get the currently authenticated user.
   * @todo Decode from stored JWT or fetch from API: GET /auth/me
   */
  async getCurrentUser(): Promise<User | null> {
    return Promise.resolve(null);
  },
};
