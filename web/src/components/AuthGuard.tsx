import React, { useState, useEffect } from 'react';
import Login from './Login';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Сессия действительна 7 дней (в миллисекундах)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const auth = localStorage.getItem('demo_auth');
    const authTime = localStorage.getItem('demo_auth_time');

    if (auth === 'true' && authTime) {
      const elapsed = Date.now() - parseInt(authTime, 10);
      if (elapsed < SESSION_DURATION) {
        setIsAuthenticated(true);
        return;
      }
    }

    // Сессия истекла или не существует
    localStorage.removeItem('demo_auth');
    localStorage.removeItem('demo_auth_time');
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Пока проверяем авторизацию
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Не авторизован
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Авторизован
  return <>{children}</>;
};

export default AuthGuard;
