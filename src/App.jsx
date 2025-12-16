import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import SkeletonLoader from './components/ui/SkeletonLoader';

// Lazy load all page components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FarmersPage = lazy(() => import('./pages/FarmersPage'));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'));
const LandsPage = lazy(() => import('./pages/LandsPage'));
const QualityControlPage = lazy(() => import('./pages/QualityControlPage'));
const StoragePage = lazy(() => import('./pages/StoragePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-7xl mx-auto space-y-6">
      <SkeletonLoader type="stat" count={4} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" />
      <SkeletonLoader type="card" count={2} />
    </div>
  </div>
);

function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="farmers" element={<FarmersPage />} />
                <Route path="lands" element={<LandsPage />} />
                <Route path="delivery" element={<DeliveryPage />} />
                <Route path="quality" element={<QualityControlPage />} />
                <Route path="storage" element={<StoragePage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </DataProvider>
  );
}

export default App;
