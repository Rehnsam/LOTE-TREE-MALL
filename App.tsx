
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadManagement from './pages/LeadManagement';
import Pipeline from './pages/Pipeline';
import Reports from './pages/Reports';
import LoginPage from './pages/LoginPage';
import AIAssistant from './components/AIAssistant';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <AuthGate>
            <LoginPage />
          </AuthGate>
        } 
      />
      
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<LeadManagement />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <AIAssistant />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
