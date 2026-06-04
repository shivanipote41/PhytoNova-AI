import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import BrandedLoader from '../components/ui/BrandedLoader';

const HomePage = lazy(() => import('../pages/Home/HomePage'));
const AuthPage = lazy(() => import('../pages/Auth/AuthPage'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));
const DetectionPage = lazy(() => import('../pages/Detection/DetectionPage'));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const MarketplacePage = lazy(() => import('../pages/Marketplace/MarketplacePage'));

function AppRoutes() {
  return (
    <Suspense fallback={<BrandedLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="detect" element={<DetectionPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="auth" element={<AuthPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;