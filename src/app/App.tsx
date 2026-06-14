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
import { MyDocumentsPage } from './pages/documents/MyDocumentsPage';
import { AIChat } from './pages/AIChat';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/admin/adminDashboardPage';
import { UserPage } from './pages/admin/adminUser';
import { DocumentPage } from './pages/admin/adminDocument';
import { AIChatPage } from './pages/admin/adminAIChat';
import { AdminProductPage } from './pages/admin/adminProduct';
import { CategoryPage } from './pages/admin/adminCategory';
import { SubjectPage } from './pages/admin/adminSubject';

// Layout
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { AdminLayout } from './components/layout/AdminLayout';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        return parsed.role === 'ADMIN';
      }
    } catch (e) {}
    return false;
  });

  useEffect(() => {
    const updateAuth = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          setIsAdmin(parsed.role === 'ADMIN');
          return;
        }
      } catch (e) {}
      setIsAdmin(false);
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
                <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
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
                  <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
                ) : (
                  <LoginPage />
                )
              }
            />

            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
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

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="user" element={<UserPage />} />
            <Route path="document" element={<DocumentPage />} />
            <Route path="category" element={<CategoryPage />} />
            <Route path="subject" element={<SubjectPage />} />
            <Route path="product" element={<AdminProductPage />} />
            <Route path="aichat" element={<AIChatPage />} />
          </Route>

          {/* Protected */}
          <Route element={<ProtectedWrapper isAuthenticated={isAuthenticated} />}>
            <Route element={<MainLayout />}>
              <Route 
                path="/dashboard" 
                element={
                  isAdmin ? <Navigate to="/admin/dashboard" replace /> : <DashboardPage />
                } 
              />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              <Route path="/my-documents" element={<MyDocumentsPage />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}