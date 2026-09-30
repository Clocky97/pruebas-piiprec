'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isGuest: boolean;
  isCitizen: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  setQuickRole: (targetRole: 'guest' | 'citizen' | 'administrator') => void;
  guestActionBlocked: string | null;
  setGuestActionBlocked: (actionName: string | null) => void;
  requireAuth: (actionName: string, requiredRole?: UserRole) => boolean;
  backendOnline: boolean;
  refreshBackendStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [guestActionBlocked, setGuestActionBlocked] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const refreshBackendStatus = async () => {
    const isHealthy = await apiService.checkHealth();
    setBackendOnline(isHealthy);
  };

  useEffect(() => {
    refreshBackendStatus();
    // Load persisted session
    const savedToken = localStorage.getItem('piiprec_token');
    const savedUser = localStorage.getItem('piiprec_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('piiprec_token');
        localStorage.removeItem('piiprec_user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiService.login({ email, password });
    if (res.data) {
      const u = res.data.user;
      const t = res.data.token;
      setUser(u);
      setToken(t);
      localStorage.setItem('piiprec_token', t);
      localStorage.setItem('piiprec_user', JSON.stringify(u));
      setGuestActionBlocked(null);
    }
  };

  const register = async (payload: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
  }) => {
    const res = await apiService.register(payload);
    if (res.data) {
      // Auto-login or set user
      const registeredUser: User = {
        id: res.data.id || 102,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        userName: res.data.userName,
        email: res.data.email,
        role: 'citizen',
        isActive: true,
      };
      const demoToken = 'jwt-registered-' + Date.now();
      setUser(registeredUser);
      setToken(demoToken);
      localStorage.setItem('piiprec_token', demoToken);
      localStorage.setItem('piiprec_user', JSON.stringify(registeredUser));
      setGuestActionBlocked(null);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('piiprec_token');
    localStorage.removeItem('piiprec_user');
  };

  const setQuickRole = (targetRole: 'guest' | 'citizen' | 'administrator') => {
    if (targetRole === 'guest') {
      logout();
      return;
    }
    if (targetRole === 'citizen') {
      const demoCitizen: User = {
        id: 101,
        firstName: 'Juan',
        lastName: 'Pérez',
        userName: 'juan_ciudadano',
        email: 'ciudadano@piiprec.gob.ar',
        role: 'citizen',
        isActive: true,
      };
      setUser(demoCitizen);
      setToken('demo-citizen-token');
      localStorage.setItem('piiprec_token', 'demo-citizen-token');
      localStorage.setItem('piiprec_user', JSON.stringify(demoCitizen));
      setGuestActionBlocked(null);
      return;
    }
    if (targetRole === 'administrator') {
      const demoAdmin: User = {
        id: 99,
        firstName: 'Administrador',
        lastName: 'PIIPreC',
        userName: 'admin_formosa',
        email: 'admin@piiprec.gob.ar',
        role: 'administrator',
        isActive: true,
      };
      setUser(demoAdmin);
      setToken('demo-admin-token');
      localStorage.setItem('piiprec_token', 'demo-admin-token');
      localStorage.setItem('piiprec_user', JSON.stringify(demoAdmin));
      setGuestActionBlocked(null);
      return;
    }
  };

  const role: UserRole = user ? user.role : 'guest';
  const isGuest = role === 'guest';
  const isCitizen = role === 'citizen' || role === 'administrator';
  const isAdmin = role === 'administrator';
  const isModerator = role === 'moderator' || role === 'technician-analyst' || role === 'administrator';

  const requireAuth = (actionName: string, requiredRole: UserRole = 'citizen'): boolean => {
    if (isGuest) {
      setGuestActionBlocked(actionName);
      return false;
    }
    if (requiredRole === 'administrator' && !isAdmin) {
      alert('Esta acción requiere permisos de Administrador.');
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isGuest,
        isCitizen,
        isAdmin,
        isModerator,
        login,
        register,
        logout,
        setQuickRole,
        guestActionBlocked,
        setGuestActionBlocked,
        requireAuth,
        backendOnline,
        refreshBackendStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
