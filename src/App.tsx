import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RescueProvider } from './contexts/RescueContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import RescueStep1 from './pages/RescueStep1';
import RescueStep2 from './pages/RescueStep2';
import RescueStep3 from './pages/RescueStep3';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RescueProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['CITIZEN', 'RESCUE_TEAM']}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/coordinator" element={
                <ProtectedRoute allowedRoles={['COORDINATOR']}>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/rescue/step1" element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                  <RescueStep1 />
                </ProtectedRoute>
              } />
              <Route path="/rescue/step2" element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                  <RescueStep2 />
                </ProtectedRoute>
              } />
              <Route path="/rescue/step3" element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                  <RescueStep3 />
                </ProtectedRoute>
              } />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </RescueProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
