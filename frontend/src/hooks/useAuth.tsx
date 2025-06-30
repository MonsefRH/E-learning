
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  role: "manager" | "trainer" | "learner";
  email?: string;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Demo users for development
  const demoUsers: Record<string, { password: string; user: User }> = {
    admin: {
      password: "admin123",
      user: { id: "1", username: "admin", role: "manager", email: "admin@example.com" }
    },
    trainer: {
      password: "trainer123",
      user: { id: "2", username: "trainer", role: "trainer", email: "trainer@example.com" }
    },
    learner: {
      password: "learner123",
      user: { id: "3", username: "learner", role: "learner", email: "learner@example.com" }
    }
  };

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const demoUser = demoUsers[username];
    
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem("user", JSON.stringify(demoUser.user));
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
