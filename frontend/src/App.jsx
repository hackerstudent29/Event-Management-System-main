import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifySignupOtp from './pages/VerifySignupOtp';

// Imports updated
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import OrderSummary from './pages/OrderSummary';
import TicketPage from './pages/TicketPage';
import ScannerPage from './pages/ScannerPage';
import PublicVerifyPage from './pages/PublicVerifyPage';

import { MessageProvider } from './context/MessageContext';
import { ToastProvider } from './components/ui/toast-1';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/" />;
  return children;
};


function App() {
  return (
    <Router>
      <ToastProvider>
        <MessageProvider>
          <AuthProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
              <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/verify-signup-otp" element={<PublicRoute><VerifySignupOtp /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-summary"
                element={
                  <ProtectedRoute>
                    <OrderSummary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ticket/:bookingId"
                element={
                  <ProtectedRoute>
                    <TicketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner"
                element={
                  <ProtectedRoute role="ADMIN">
                    <ScannerPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/verify/:bookingId" element={<PublicVerifyPage />} />
            </Routes>
          </AuthProvider>
        </MessageProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
