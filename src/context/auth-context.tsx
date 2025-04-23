/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { loginApi } from "@/services/auth-service";
import { toast } from "sonner";


type UserRole = "ROLE_WRITE" | "ROLE_READ" | "ROLE_ADMIN";

interface User {
  id: number;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  contact: string;
  roles: Array<{
    roleId: number;
    operatorRole: string;
  }>;
  hierarchy: number;
  nodes: Array<{
    id: number;
    name: string;
    parent_id: number | null;
  }>;
  //   [key: string]: any;
}

interface AuthTokens {
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {
    console.error("AuthProvider not found");
  },
  logout: () => console.error("AuthProvider not found"),
  isLoading: false,
  isAuthenticated: false,
  getAccessToken: () => {
    console.error("AuthProvider not found");
    return null;
  },
});

const USER_STORAGE_KEY = "auth_user";
const TOKEN_STORAGE_KEY = "auth_tokens";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    const checkUserAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (storedUser && storedTokens) {
          const userData = JSON.parse(storedUser) as User;
          const tokenData = JSON.parse(storedTokens) as AuthTokens;

          if (userData?.id && userData?.email && tokenData?.accessToken) {
            setUser(userData);
            setTokens(tokenData);
          } else {
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

    checkUserAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      setIsLoading(true);

      try {
        const loginData = await loginApi(email, password);

        const userInfo = loginData.user_info;
        const userData: User = {
          id: userInfo.id,
          name: `${userInfo.firstname} ${userInfo.lastname}`,
          email: userInfo.email,
          firstName: userInfo.firstname,
          lastName: userInfo.lastname,
          contact: userInfo.contact,
          roles: userInfo.roles,
          hierarchy: userInfo.hierarchy,
          nodes: userInfo.nodes,
        };

        const newTokens: AuthTokens = {
          accessToken: loginData.access_token,
        };

        setUser(userData);
        setTokens(newTokens);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokens));
        router.push("/dashboard");
      } catch (error) {
        if (error instanceof Error) {
          console.error("Login error:", error.message);
          toast.error(error.message);
          throw error; // Re-throw the error to propagate it further
        } else {
          const errorMessage = "An unexpected error occurred";
          console.error("Login error:", errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage); // Throw a new error with a generic message
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const getAccessToken = useCallback((): string | null => {
    return tokens?.accessToken ?? null;
  }, [tokens]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
      isAuthenticated: !!user,
      getAccessToken,
    }),
    [user, login, logout, isLoading, getAccessToken],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}
