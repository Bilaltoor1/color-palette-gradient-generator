"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresPhoneVerification, setRequiresPhoneVerification] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const adminData = await response.json();
        setAdmin(adminData);
        
        // Check if phone verification is required
        if (adminData.requiresPhoneVerification && !adminData.isPhoneVerified) {
          setRequiresPhoneVerification(true);
        } else {
          setRequiresPhoneVerification(false);
        }
      } else {
        setAdmin(null);
        setRequiresPhoneVerification(false);
      }
    } catch (error) {
      setAdmin(null);
      setRequiresPhoneVerification(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const adminData = await response.json();
        setAdmin(adminData);
        
        // Check if phone verification is required
        if (adminData.requiresPhoneVerification && !adminData.isPhoneVerified) {
          setRequiresPhoneVerification(true);
        } else {
          setRequiresPhoneVerification(false);
        }
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      });
      toast.success('Logged out successfully');
    } catch (error) {
      // Ignore errors on logout
      toast.success('Logged out successfully');
    } finally {
      setAdmin(null);
      setRequiresPhoneVerification(false);
      // Check if user is on admin page and redirect accordingly
      const isOnAdminPage = window.location.pathname.startsWith('/admin');
      if (isOnAdminPage) {
        window.location.href = '/auth/login';
      }
    }
  };

  const completePhoneVerification = (phoneNumber) => {
    // Update admin state to reflect phone verification
    setAdmin(prev => ({
      ...prev,
      isPhoneVerified: true,
      phoneNumber: phoneNumber
    }));
    setRequiresPhoneVerification(false);
    toast.success('Phone verification completed!');
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      loading, 
      login, 
      logout, 
      checkAuth, 
      requiresPhoneVerification,
      completePhoneVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
