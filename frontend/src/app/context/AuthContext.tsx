import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest } from '../lib/api';
import type { ApiUser, AuthLoginInput, AuthRegisterInput, AuthSession, User, UserRole } from '../types/auth';

const AUTH_TOKEN_STORAGE_KEY = 'ethiofund.auth.token';
const AUTH_USER_STORAGE_KEY = 'ethiofund.auth.user';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (input: AuthLoginInput) => Promise<User>;
  register: (input: AuthRegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeRole(role: string): UserRole {
  if (role === 'donor' || role === 'organizer' || role === 'admin') {
    return role;
  }

  return 'donor';
}

function mapApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id || apiUser.user_id || '',
    name: apiUser.full_name,
    email: apiUser.email,
    role: normalizeRole(apiUser.role),
    phoneNumber: apiUser.phone_number,
    status: apiUser.status,
  };
}

function loadStoredSession(): { token: string | null; user: User | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!token || !rawUser) {
    return { token, user: null };
  }

  try {
    return { token, user: JSON.parse(rawUser) as User };
  } catch {
    return { token, user: null };
  }
}

function saveSession(session: AuthSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.token);
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(session.user));
}

function clearStoredSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialSession = loadStoredSession();
  const [user, setUser] = useState<User | null>(initialSession.user);
  const [token, setToken] = useState<string | null>(initialSession.token);
  const [ready, setReady] = useState(!initialSession.token);

  const clearSession = () => {
    setUser(null);
    setToken(null);
    clearStoredSession();
  };

  const setSession = (session: AuthSession) => {
    setUser(session.user);
    setToken(session.token);
    saveSession(session);
  };

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }

    let cancelled = false;

    const restoreSession = async () => {
      try {
        const response = await apiRequest<{ success: boolean; user: ApiUser }>('/users/me', {
          authToken: token,
        });

        if (cancelled) {
          return;
        }

        setUser(mapApiUser(response.user));
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async ({ email, password }: AuthLoginInput): Promise<User> => {
    const response = await apiRequest<{ success: boolean; token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const mappedUser = mapApiUser(response.user);
    setSession({ token: response.token, user: mappedUser });
    return mappedUser;
  };

  const register = async ({ full_name, email, phone_number, password, role }: AuthRegisterInput): Promise<User> => {
    await apiRequest<{ success: boolean; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name, email, phone_number, password, role }),
    });

    return login({ email, password });
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await apiRequest<{ success: boolean }>('/auth/logout', {
          method: 'POST',
          authToken: token,
        });
      }
    } finally {
      clearSession();
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, ready, login, register, logout, clearSession }),
    [ready, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}