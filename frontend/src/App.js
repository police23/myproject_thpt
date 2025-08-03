import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import AdminPanel from './Components/Admin/Panel/AdminPanel';
import UserPanel from './Components/User/Panel/UserPanel';
import TestTaking from './Components/User/Test/TestTaking/TestTaking';
import TestReview from './Components/User/Test/TestReview/TestReview';
import axios from 'axios';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
    <AuthProvider>
      <BrowserRouter>
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

            
            <Route
              path="/admin/*"
              element={
                isLoggedIn && currentUser?.role === 'admin' ? (
                  <AdminPanel onLogout={handleLogout} user={currentUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Update path for taking exams */}
            <Route
              path="/student/test-taking/:id"
              element={
                isLoggedIn ? (
                  <TestTaking />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Route for reviewing exam results */}
            <Route
              path="/student/test-review/:id"
              element={
                isLoggedIn ? (
                  <TestReview />
                ) : (
                  <Navigate to="/" />
                )
              }
            />


            {/* Các route cho từng tab của UserPanel */}
            <Route
              path="/student/dashboard"
              element={
                isLoggedIn ? (
                  <UserPanel onLogout={handleLogout} user={currentUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/student/exams"
              element={
                isLoggedIn ? (
                  <UserPanel onLogout={handleLogout} user={currentUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/student/results"
              element={
                isLoggedIn ? (
                  <UserPanel onLogout={handleLogout} user={currentUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/student/profile"
              element={
                isLoggedIn ? (
                  <UserPanel onLogout={handleLogout} user={currentUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />



            {/* Thêm Route cho not found */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
