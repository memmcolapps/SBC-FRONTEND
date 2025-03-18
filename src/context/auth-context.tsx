"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Types with specific roles to prevent invalid assignments
type UserRole = "admin" | "user" | "guest";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean; // New helper property
  getAccessToken: () => string | null; // Provide access to the token for API calls
  refreshTokenIfNeeded: () => Promise<boolean>; // Allow manual token refresh
}

// Default context value with typed error functions
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {
    console.error("AuthProvider not found");
    return false;
  },
  logout: () => console.error("AuthProvider not found"),
  isLoading: false,
  isAuthenticated: false,
  getAccessToken: () => {
    console.error("AuthProvider not found");
    return null;
  },
  refreshTokenIfNeeded: async () => {
    console.error("AuthProvider not found");
    return false;
  },
});

// Storage key constants to avoid typos and repeated strings
const USER_STORAGE_KEY = "auth_user";
const TOKEN_STORAGE_KEY = "auth_tokens";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if token is valid or has expired
  const isTokenExpired = useCallback((expiresAt: number): boolean => {
    // Add a small buffer (e.g., 10 seconds) to account for network latency
    return Date.now() >= expiresAt - 10000;
  }, []);

  // Handle token expiration and refresh
  const handleTokenExpiration = useCallback(async (): Promise<boolean> => {
    if (!tokens?.refreshToken) return false;

    try {
      // In a real app, call your refresh token API endpoint
      // For demo, we'll simulate a token refresh
      console.log("Refreshing token...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create new tokens with new expiration (30 minutes from now)
      const newTokens: AuthTokens = {
        accessToken: `refreshed_token_${Date.now()}`,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      };

      setTokens(newTokens);
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokens));
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, log the user out
      logout();
      return false;
    }
  }, [tokens]);

  // Set up token expiration checker
  useEffect(() => {
    if (!tokens) return;

    // Don't set up timer if token is already expired
    if (isTokenExpired(tokens.expiresAt)) {
      handleTokenExpiration().catch(() => logout());
      return;
    }

    // Calculate time until expiration
    const timeUntilExpiry = tokens.expiresAt - Date.now() - 30000; // Refresh 30 seconds before expiry

    // Set up timer to refresh token before it expires
    const expirationTimer = setTimeout(
      () => {
        handleTokenExpiration().catch(() => logout());
      },
      Math.max(0, timeUntilExpiry),
    );

    // Clean up timer on unmount
    return () => clearTimeout(expirationTimer);
  }, [tokens, isTokenExpired, handleTokenExpiration]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkUserAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (storedUser && storedTokens) {
          // Parse stored data
          const userData = JSON.parse(storedUser) as User;
          const tokenData = JSON.parse(storedTokens) as AuthTokens;

          // Basic validation that the data has the expected shape
          if (
            userData?.id &&
            userData?.email &&
            tokenData?.accessToken &&
            tokenData?.expiresAt
          ) {
            // Check if token is expired
            if (isTokenExpired(tokenData.expiresAt)) {
              // Token is expired, try to refresh if we have a refresh token
              if (tokenData.refreshToken) {
                // Store tokens to allow refresh attempt
                setTokens(tokenData);
              } else {
                // No refresh token, clear storage and keep user logged out
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
              }
            } else {
              // Token is valid, set user and tokens
              setUser(userData);
              setTokens(tokenData);
            }
          } else {
            // Invalid data, clear storage
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to parse stored auth data:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    // Execute inside try/catch in case localStorage is not available (e.g., in SSR)
    try {
      checkUserAuth();
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setIsLoading(false);
    }
  }, [isTokenExpired]);

  // Memoize login function to prevent unnecessary re-renders
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (!email || !password) return false;

      setIsLoading(true);

      try {
        // In a real app, this would be an API call
        // For demo purposes, simulate a successful login with any credentials

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const user: User = {
          id: "1",
          name: "Admin User",
          email,
          role: "admin",
        };

        // Create tokens with expiration time (30 minutes from now)
        const newTokens: AuthTokens = {
          accessToken: `token_${Date.now()}`,
          refreshToken: `refresh_${Date.now()}`,
          expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
        };

        // Store user and tokens in state and localStorage
        setUser(user);
        setTokens(newTokens);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokens));
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Memoize logout function
  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
    router.push("/login");
  }, [router]);

  // Get access token for API calls
  const getAccessToken = useCallback((): string | null => {
    return tokens?.accessToken ?? null;
  }, [tokens]);

  // Allow manual token refresh when needed
  const refreshTokenIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!tokens) return false;

    // Check if token is expired or about to expire (within 1 minute)
    if (Date.now() > tokens.expiresAt - 60000) {
      return handleTokenExpiration();
    }

    // Token is still valid
    return true;
  }, [tokens, handleTokenExpiration]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
      isAuthenticated: !!user,
      getAccessToken,
      refreshTokenIfNeeded,
    }),
    [user, login, logout, isLoading, getAccessToken, refreshTokenIfNeeded],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook with better error message
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}
