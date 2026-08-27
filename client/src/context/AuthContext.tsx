import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";
import type { AuthResponse, User, UserRole } from "../types";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;

  login: (email: string, password: string) => Promise<User>;

  register: (data: RegisterData) => Promise<User>;

  logout: () => void;

  updateUser: (updatedUser: Partial<User>) => void;

  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem("user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const currentUser = response.data.data.user;

        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        console.error("Session restoration failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    const { token, user: loggedInUser } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(data: RegisterData): Promise<User> {
    const response = await api.post<AuthResponse>("/auth/register", data);

    const { token, user: registeredUser } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(registeredUser));

    setUser(registeredUser);
    return registeredUser;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  function updateUser(updatedUser: Partial<User>) {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
