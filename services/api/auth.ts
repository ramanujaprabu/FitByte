/**
 * FitByte — Auth Service
 *
<<<<<<< HEAD
 * Wraps Supabase Auth (email/password). A `profiles` row (plus defaults in
 * `body_metrics` / `calorie_targets`) is created automatically server-side
 * by the `on_auth_user_created` trigger — see supabase/migrations/0001_init.sql.
 */
import { supabase } from '@/lib/supabase';
=======
 * Placeholder for authentication integration.
 * Replace the `Promise.resolve` calls with real API/SDK calls when backend is ready.
 *
 * Integrations to wire up:
 *   - Firebase Auth / Supabase Auth / custom JWT
 *   - OAuth providers (Google, Apple)
 *   - Token storage (expo-secure-store)
 */

>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
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

<<<<<<< HEAD
function mapProfileToUser(profile: any, fallbackUser?: any): User {
  if (profile) {
    return {
      id: profile.id,
      name: profile.name || fallbackUser?.user_metadata?.name || fallbackUser?.email?.split('@')[0] || 'User',
      email: profile.email || fallbackUser?.email || '',
      avatarUrl: profile.avatar_url ?? '',
      goal: profile.goal ?? '',
      quote: profile.quote ?? '',
      level: profile.level ?? 1,
      streakDays: profile.streak_days ?? 0,
      onboardingCompleted: profile.onboarding_completed ?? false,
      age: profile.age ?? null,
      sex: profile.sex ?? null,
    };
  }

  return {
    id: fallbackUser?.id ?? 'user-1',
    name: fallbackUser?.user_metadata?.name || fallbackUser?.email?.split('@')[0] || 'User',
    email: fallbackUser?.email ?? '',
    avatarUrl: '',
    goal: 'Fitness',
    quote: '',
    level: 1,
    streakDays: 1,
    onboardingCompleted: false,
    age: null,
    sex: null,
  };
}

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    return mapProfileToUser(profile, data.user);
  },

  async register({ name, email, password }: RegisterCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      // Supabase creates the auth user (and the profile, via the DB trigger) in
      // the same request that tries to send the confirmation email. On the
      // free-tier's built-in email provider — rate-limited to a couple of
      // sends/hour — the account creation succeeds but that last email step
      // fails, and this call still reports an error even though the account
      // now exists and can already sign in. Treat that class of error as a
      // "check your email" outcome instead of a hard failure.
      if (/error sending.*email|email rate limit exceeded/i.test(error.message)) {
        throw new Error('Account created — check your email to confirm before signing in.');
      }
      throw error;
    }
    if (!data.user) {
      throw new Error('Check your email to confirm your account before logging in.');
    }

    // When "Confirm email" is on, Supabase won't error for an email that's
    // already registered — to avoid leaking which emails exist, it returns a
    // fake success instead, distinguishable only by an empty `identities`
    // array (a brand-new signup always has at least one identity). Without
    // this check the UI would tell an existing user their account was just
    // created and send them to "check your email" for a mail that never
    // comes for a new signup.
    if (data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Try logging in instead.');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    return mapProfileToUser(profile, data.user);
  },

  async resetPasswordForEmail(email: string, redirectTo?: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || 'fitbyte://auth-callback?type=recovery',
    });
    if (error) throw error;
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async resendVerificationEmail(email: string, redirectTo?: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo || 'fitbyte://auth-callback?type=signup',
      },
    });
    if (error) throw error;
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .maybeSingle();

    return mapProfileToUser(profile, sessionData.session.user);
=======
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
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
  },
};
