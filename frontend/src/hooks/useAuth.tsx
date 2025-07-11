import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, LoginInput } from "../lib/services/authService";
import api from "../lib/api";

export interface User {
  id: number; // Changed from string to number to match backend
  username: string;
  role: "manager" | "trainer" | "learner";
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>; // Added to refresh user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup axios interceptor for authentication
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  // Fetch user details on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await authService.getCurrentUser();
          console.log("Fetched user:", userData);
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const credentials: LoginInput = { username, password };
      const response = await authService.login(credentials);
      console.log("Login response:", response);
      setUser(response.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Function to refresh user data (used in NotFound)
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const userData = await authService.getCurrentUser();
        console.log("Refreshed user:", userData);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};