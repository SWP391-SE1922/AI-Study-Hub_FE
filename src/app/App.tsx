import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage }  from './pages/DashboardPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { DocumentDetailPage } from './pages/documents/DocumentDetailPage';
import { AIChat } from './pages/AIChat';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/admin/AdminPage';

// Layout
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { AdminLayout } from './components/layout/adminLayout';

function ProtectedWrapper({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function AdminProtectedWrapper({
  isAuthenticated,
  userRole,
}: {
  isAuthenticated: boolean;
  userRole: string;
}) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('userRole') || 'student';
  });

  useEffect(() => {
    const updateAuth = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
      setUserRole(localStorage.getItem('userRole') || 'student');
    };

    window.addEventListener('storage', updateAuth);
    window.addEventListener('authChange', updateAuth);

    return () => {
      window.removeEventListener('storage', updateAuth);
      window.removeEventListener('authChange', updateAuth);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                userRole === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  userRole === 'admin' ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <LoginPage />
                )
              }
            />

            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  userRole === 'admin' ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <RegisterPage />
                )
              }
            />

            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />
          </Route>

          {/* Student Protected */}
          <Route element={<ProtectedWrapper isAuthenticated={isAuthenticated} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin Protected */}
          <Route element={<AdminProtectedWrapper isAuthenticated={isAuthenticated} userRole={userRole} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}