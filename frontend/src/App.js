import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import AdminLayout from './Components/Admin/Layout/AdminLayout';
import UserLayout from './Components/User/Layout/UserLayout';
import axios from 'axios';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

// Set default base URL for axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
        {/* ToastContainer for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

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

          {/* Admin routes - all nested inside AdminLayout to maintain layout */}
          <Route
            path="/admin/dashboard/*"
            element={
              isLoggedIn && currentUser?.role === 'admin' ? (
                <AdminLayout onLogout={handleLogout} user={currentUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/student/dashboard/*"
            element={
              isLoggedIn ? (
                <UserLayout onLogout={handleLogout} user={currentUser} />
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
