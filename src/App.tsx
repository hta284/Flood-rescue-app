import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RescueProvider } from './contexts/RescueContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
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
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/rescue/step1" element={
                <ProtectedRoute>
                  <RescueStep1 />
                </ProtectedRoute>
              } />
              <Route path="/rescue/step2" element={
                <ProtectedRoute>
                  <RescueStep2 />
                </ProtectedRoute>
              } />
              <Route path="/rescue/step3" element={
                <ProtectedRoute>
                  <RescueStep3 />
                </ProtectedRoute>
              } />
              
              <Route path="/" element={<Navigate to="/rescue/step1" replace />} />
            </Routes>
          </Router>
        </RescueProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
