import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import AdminDashboard from './Components/Admin/AdminDashboard';
import UserDashboard from './Components/User/UserDashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Kiểm tra xem đã có user được lưu trong localStorage chưa
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };

  const switchToRegister = () => {
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  const loginAsAdmin = () => {
    const adminUser = {
      name: 'Admin Demo',
      email: 'admin@example.com',
      role: 'admin',
      id: '999'
    };
    handleLogin(adminUser);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            isLoggedIn ? (
              <Navigate to={currentUser?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />
            ) : (
              showLogin ? (
                <Login
                  switchToRegister={switchToRegister}
                  onLogin={handleLogin}
                  loginAsAdmin={loginAsAdmin}
                />
              ) : (
                <Register switchToLogin={switchToLogin} onRegister={handleLogin} />
              )
            )
          } />

          {/* Admin routes - all nested inside AdminDashboard to maintain layout */}
          <Route
            path="/admin/dashboard/*"
            element={
              isLoggedIn && currentUser?.role === 'admin' ? (
                <AdminDashboard onLogout={handleLogout} user={currentUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/student/dashboard/*"
            element={
              isLoggedIn ? (
                <UserDashboard onLogout={handleLogout} user={currentUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Thêm Route cho not found */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
