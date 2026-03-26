import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/main-layout';
import { AuthPage } from '@/pages/auth-page';

function AuthGuard({ children }: { readonly children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  return token ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AuthRedirect() {
  const token = localStorage.getItem('auth_token');
  return token ? <Navigate to="/" replace /> : <AuthPage />;
}

export function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRedirect />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      />
    </Routes>
  );
}
