import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "./queryClient";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: "teacher" | "student") => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    setUser(data.user);
    queryClient.invalidateQueries({ queryKey: ["/api"] });
  };

  const register = async (email: string, password: string, name: string, role: "teacher" | "student") => {
    const response = await apiRequest("POST", "/api/auth/register", { email, password, name, role });
    const data = await response.json();
    setUser(data.user);
    queryClient.invalidateQueries({ queryKey: ["/api"] });
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout", {});
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
