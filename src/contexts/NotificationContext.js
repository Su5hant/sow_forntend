import React, { createContext, useContext, useState } from 'react';
import './NotificationSystem.css';

// Create notification context
const NotificationContext = createContext();

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Individual notification component
const Notification = ({ notification, onRemove }) => {
  const { id, type, title, message, duration } = notification;

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const getIcon = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✓';
      case NOTIFICATION_TYPES.ERROR:
        return '✕';
      case NOTIFICATION_TYPES.WARNING:
        return '⚠';
      case NOTIFICATION_TYPES.INFO:
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div className={`notification notification--${type}`}>
      <div className="notification__icon">
        {getIcon()}
      </div>
      <div className="notification__content">
        {title && <div className="notification__title">{title}</div>}
        <div className="notification__message">{message}</div>
      </div>
      <button 
        className="notification__close"
        onClick={() => onRemove(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

// Notification container component
const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = ({ 
    type = NOTIFICATION_TYPES.INFO, 
    title, 
    message, 
    duration = 5000 
  }) => {
    const id = Date.now() + Math.random();
    
    const notification = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (message, title, duration) => 
    addNotification({ type: NOTIFICATION_TYPES.SUCCESS, message, title, duration });

  const showError = (message, title, duration) => 
    addNotification({ type: NOTIFICATION_TYPES.ERROR, message, title, duration });

  const showWarning = (message, title, duration) => 
    addNotification({ type: NOTIFICATION_TYPES.WARNING, message, title, duration });

  const showInfo = (message, title, duration) => 
    addNotification({ type: NOTIFICATION_TYPES.INFO, message, title, duration });

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};