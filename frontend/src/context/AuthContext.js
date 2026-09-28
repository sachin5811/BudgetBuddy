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

  const sendRegisterOTP = async (name, email, password) => {
    const { data } = await API.post("/auth/register/send-otp", {
      name,
      email,
      password,
    });
    return data;
  };

  const verifyRegisterOTP = async (name, email, password, otp_code) => {
    const { data } = await API.post("/auth/register/verify-otp", {
      name,
      email,
      password,
      otp_code,
    });
    localStorage.setItem("bb_token", data.access_token);
    setUser(data.user);
    return data.user;
  };

  const sendForgotPasswordOTP = async (email) => {
    const { data } = await API.post("/auth/forgot-password/send-otp", { email });
    return data;
  };

  const verifyForgotPasswordOTP = async (email, otp_code, new_password) => {
    const { data } = await API.post("/auth/forgot-password/verify-otp", {
      email,
      otp_code,
      new_password,
    });
    return data;
  };

  const resendOTP = async (email, purpose) => {
    const { data } = await API.post("/auth/resend-otp", { email, purpose });
    return data;
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
      value={{
        user,
        setUser,
        login,
        register,
        sendRegisterOTP,
        verifyRegisterOTP,
        sendForgotPasswordOTP,
        verifyForgotPasswordOTP,
        resendOTP,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { formatApiErrorDetail };
