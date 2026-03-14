import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "re_auth_user";

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      const stored = readStoredUser();
      if (stored?.token) {
        config.headers.Authorization = `Bearer ${stored.token}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  const saveUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password, isAgent: true });
      saveUser(data);
      return { success: true, user: data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  }, [saveUser]);

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/agent/register", formData);
      saveUser(data);
      return { success: true, user: data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  }, [saveUser]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isLoggedIn: !!user }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
