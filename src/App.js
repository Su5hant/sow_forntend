import React from 'react';
import AuthScreen from './AuthScreen';
import ProductList from './ProductList';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Main app component that decides which screen to show
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

  // Show product list if authenticated, otherwise show auth screen
  return isAuthenticated ? <ProductList /> : <AuthScreen />;
};

function App() {
  return (
    <div className="App">
      <NotificationProvider>
        <I18nProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </I18nProvider>
      </NotificationProvider>
    </div>
  );
}

export default App;