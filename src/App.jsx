import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FarmersPage from './pages/FarmersPage';
import DeliveryPage from './pages/DeliveryPage';
import LandsPage from './pages/LandsPage';
import QualityControlPage from './pages/QualityControlPage';
import StoragePage from './pages/StoragePage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="farmers" element={<FarmersPage />} />
              <Route path="lands" element={<LandsPage />} />
              <Route path="delivery" element={<DeliveryPage />} />
              <Route path="quality" element={<QualityControlPage />} />
              <Route path="storage" element={<StoragePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </DataProvider>
  );
}

export default App;
