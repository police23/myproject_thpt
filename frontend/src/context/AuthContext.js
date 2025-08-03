import React, { createContext, useContext, useState, useEffect } from 'react';

// Tạo context
const AuthContext = createContext();

// Custom hook để sử dụng AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy user từ localStorage nếu có
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Đăng nhập: lưu user vào state và localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Đăng xuất: xóa user khỏi state và localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Cập nhật user (ví dụ đổi email)
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
