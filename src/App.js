import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthScreen from './AuthScreen';
import ProductList from './ProductList';
import EmailVerification from './EmailVerification';
import Terms from './Terms';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { NotificationProvider } from './contexts/NotificationContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/products" replace /> : <AuthScreen />} 
      />
      
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <NotificationProvider>
        <I18nProvider>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </I18nProvider>
      </NotificationProvider>
    </div>
  );
}

export default App;