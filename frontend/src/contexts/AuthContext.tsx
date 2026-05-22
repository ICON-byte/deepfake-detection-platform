import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface User {
  username: string;
  email: string;
  quota_used: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  scansRemaining: number;           // for logged-in users (quota_used based)
  guestScanCount: number;           // how many scans guest has used (0-3)
  decrementScans: () => boolean;    // returns true if scan allowed, false if none left
  resetGuestScans: () => void;      // call after guest logs in to reset guest count
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DEFAULT_MONTHLY_QUOTA = 100;
const GUEST_SCAN_LIMIT = 3;
const GUEST_STORAGE_KEY = 'guest_scans_used';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestScanCount, setGuestScanCount] = useState<number>(0);
  const navigate = useNavigate();

  // Load guest scan count from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored) setGuestScanCount(parseInt(stored, 10));
    else setGuestScanCount(0);
  }, []);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const saveGuestCount = (count: number) => {
    setGuestScanCount(count);
    localStorage.setItem(GUEST_STORAGE_KEY, count.toString());
  };

  const fetchUser = async (tkn: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
      logout();
    }
  };

  // Login using OAuth2 password flow (form-urlencoded)
  const login = async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_URL}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    setToken(data.access_token);
    await fetchUser(data.access_token);
    // After successful login, reset guest scans (they now have a user account)
    resetGuestScans();
  };

  // Register using JSON
  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    // After successful registration, we do NOT auto-login – caller may redirect to login page
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    // Do NOT reset guest scans on logout – keep them for next guest session
    navigate({ to: '/login' });
  };

  const resetGuestScans = () => {
    saveGuestCount(0);
  };

  // For logged-in user: scans remaining based on quota_used
  const userScansRemaining = user ? Math.max(0, DEFAULT_MONTHLY_QUOTA - user.quota_used) : 0;

  const decrementScans = (): boolean => {
    if (user) {
      // Logged-in user: check quota
      if (userScansRemaining > 0) {
        // Optimistically decrement local state (the backend will update quota_used on analysis)
        setUser((prev) => prev ? { ...prev, quota_used: prev.quota_used + 1 } : null);
        return true;
      }
      return false;
    } else {
      // Guest user: check if under limit
      if (guestScanCount < GUEST_SCAN_LIMIT) {
        saveGuestCount(guestScanCount + 1);
        return true;
      }
      return false;
    }
  };

  // Expose scansRemaining based on user type for convenience
  const scansRemaining = user ? userScansRemaining : (GUEST_SCAN_LIMIT - guestScanCount);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        register,
        logout,
        isLoading,
        scansRemaining,
        guestScanCount,
        decrementScans,
        resetGuestScans,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}