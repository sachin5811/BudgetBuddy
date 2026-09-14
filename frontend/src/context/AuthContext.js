import React, { createContext, useContext, useEffect, useState } from "react";
import API, { formatApiErrorDetail } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = not auth, object = auth

  useEffect(() => {
    const token = localStorage.getItem("bb_token");
    if (!token) {
      setUser(false);
      return;
    }
    API.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("bb_token");
        setUser(false);
      });
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("bb_token", data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post("/auth/register", { name, email, password });
    localStorage.setItem("bb_token", data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("bb_token");
    setUser(false);
  };

  const refreshUser = async () => {
    const { data } = await API.get("/auth/me");
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { formatApiErrorDetail };
