import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { DocumentDetailPage } from './pages/documents/DocumentDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatPage } from './pages/ChatPage';
import { AdminPage } from './pages/admin/AdminPage';
import { CategoryPage } from './pages/admin/adminCategory';
import {AdminDocumentDetailPage} from './pages/admin/AdminDocumentDetailPage';



// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { AdminLayout } from './components/layout/AdminLayout';

function readStoredRole() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role || 'USER';
  } catch {
    return 'USER';
  }
}

function getDefaultHomePath() {
  return readStoredRole() === 'ADMIN' ? '/admin' : '/dashboard';
}

function ProtectedWrapper({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function AdminOnlyWrapper({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (readStoredRole() !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('authToken')) || localStorage.getItem('isAuthenticated') === 'true';
  });
  const [homePath, setHomePath] = useState<string>(() => getDefaultHomePath());

  useEffect(() => {
    const updateAuth = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('authToken')) || localStorage.getItem('isAuthenticated') === 'true');
      setHomePath(getDefaultHomePath());
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
          <Route path="/" element={isAuthenticated ? <Navigate to={homePath} replace /> : <LandingPage />} />


          <Route element={<AuthLayout />}>
            <Route path="/login" element={isAuthenticated ? <Navigate to={homePath} replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to={homePath} replace /> : <RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedWrapper isAuthenticated={isAuthenticated} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
          </Route>

          <Route element={<AdminOnlyWrapper isAuthenticated={isAuthenticated} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<AdminPage />} />
              <Route path="/admin/documents" element={<AdminPage />} />
              <Route path="/admin/aichat" element={<AdminPage />} />
              <Route path="/admin/category" element={<CategoryPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}
