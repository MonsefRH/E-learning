import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {authService, LoginInput, UserData} from "../lib/services/authService";
import api from "../lib/api";
import { jwtDecode } from "jwt-decode";

export interface User {
  id: string;
  username: string;
  role: "manager" | "trainer" | "learner";
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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

interface TokenPayload {
  sub: string;
  username: string;
  email: string;
  role: "manager" | "trainer" | "learner";
  exp: number;
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

  useEffect(() => {
    // Check for stored token and decode user information
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser({
            id: decoded.sub,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
          });
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const credentials: LoginInput = { username, password };
      const response = await authService.login(credentials);

      // Token is automatically saved by authService
      // Now decode the token to get user information
      const token = response.access_token;

      const userData: User = response.user;

      console.log("Login successful:", userData);

      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };



  return (
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
  );
};