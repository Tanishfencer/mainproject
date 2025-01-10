import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthForm } from '@/components/auth/auth-form';
import { Dashboard } from '@/components/dashboard/dashboard';
import { useAuth } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/toaster"
import VerifyEmail from '@/pages/verify';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
              <AuthForm />
            </div>
          </PublicRoute>
        }
      />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/verify/:token" element={<VerifyEmail />} />
      {/* Legacy hash route support */}
      <Route path="/#/verify/:token" element={<VerifyEmail />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
      <Toaster />
    </>
  );
}

export default App;