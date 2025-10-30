import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EditHabit from './pages/EditHabit.jsx';
import Admin from './pages/Admin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import { AuthProvider, useAuth } from './components/AuthContext.jsx';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/habits/:id"
            element={
              <PrivateRoute>
                <EditHabit />
              </PrivateRoute>
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<Admin />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
};

export default App;
