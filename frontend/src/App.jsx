import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/ui/app-layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifySignupOtp from './pages/VerifySignupOtp';

import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import OrderSummary from './pages/OrderSummary';
import TicketPage from './pages/TicketPage';
import ScannerPage from './pages/ScannerPage';
import PublicVerifyPage from './pages/PublicVerifyPage';
import ZendrumBooking from './pages/ZendrumBooking';
import PaymentSuccess from './pages/PaymentSuccess';

import { MessageProvider } from './context/MessageContext';
import ErrorBoundary from './components/ErrorBoundary';
import InactivityManager from './components/InactivityManager';

const ProtectedRoute = ({ children, role, allowEmail }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div></div>;
  if (!user) return <Navigate to="/login" />;

  const hasRole = !role || user.role === role;
  const hasEmailAccess = allowEmail && user.email === allowEmail;

  if (!hasRole && !hasEmailAccess) return <Navigate to="/" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div></div>;
  if (user) return <Navigate to="/" />;
  return children;
};

import { Toaster } from 'sonner';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <MessageProvider>
          <AuthProvider>
            <InactivityManager>
              <Toaster richColors position="top-center" />
              <Routes>
                {/* Auth routes - no layout */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/verify-signup-otp" element={<PublicRoute><VerifySignupOtp /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

                {/* Public verify page - no layout */}
                <Route path="/verify/:bookingId" element={<PublicVerifyPage />} />

                {/* Admin routes - no bottom nav */}

                <Route path="/scanner" element={<ProtectedRoute role="ADMIN" allowEmail="ramzendrum@gmail.com"><ScannerPage /></ProtectedRoute>} />

                {/* User routes - WITH AppLayout (bottom nav) */}
                <Route element={<AppLayout />}>
                  <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
                  <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
                  <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/order-summary" element={<ProtectedRoute><OrderSummary /></ProtectedRoute>} />
                  <Route path="/ticket/:bookingId" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
                  <Route path="/zendrum-booking" element={<ZendrumBooking />} />
                  <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                </Route>
              </Routes>
            </InactivityManager>
          </AuthProvider>
        </MessageProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
