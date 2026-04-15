/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import FormList from './pages/admin/FormList';
import Builder from './pages/admin/Builder';
import Publish from './pages/admin/Publish';
import Settings from './pages/admin/Settings';
import Branding from './pages/admin/Branding';
import Results from './pages/admin/Results';
import SurveyRunner from './pages/public/SurveyRunner';
import SurveyResults from './pages/public/SurveyResults';
import PublicPortal from './pages/public/PublicPortal';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { useSettingsStore } from './store/settingsStore';
import { useBuilderStore } from './store/builderStore';
import ChatWidget from './components/ChatWidget';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const theme = useAppStore((state) => state.theme);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const appHydrated = useAppStore((state) => state.hasHydrated);
  const settingsHydrated = useSettingsStore((state) => state.hasHydrated);
  const builderHydrated = useBuilderStore((state) => state.hasHydrated);

  if (!authHydrated || !appHydrated || !settingsHydrated || !builderHydrated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className={theme}>
      <BrowserRouter>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicPortal />} />
        <Route path="/forms" element={<PublicPortal />} />
        <Route path="/s/:formId" element={<SurveyRunner />} />
        <Route path="/r/:submissionId" element={<SurveyResults />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="forms" element={<FormList />} />
          <Route path="builder/:formId" element={<Builder />} />
          <Route path="publish" element={<Publish />} />
          <Route path="publish/:formId" element={<Publish />} />
          <Route path="results" element={<Results />} />
          <Route path="results/:formId" element={<Results />} />
          <Route path="branding" element={<Branding />} />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  </div>
);
}



