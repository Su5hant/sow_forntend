import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthScreen from './AuthScreen';
import ProductList from './ProductList';
import EmailVerification from './EmailVerification';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Protected route component
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

// Main app component with routing
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
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
      {/* Email verification route - accessible without authentication */}
      <Route path="/verify-email" element={<EmailVerification />} />
      
      {/* Home route - shows auth screen or redirects to products */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/products" replace /> : <AuthScreen />} 
      />
      
      {/* Products route - protected */}
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all - redirect to home */}
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