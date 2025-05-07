import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';  

type UserRole = 'staff' | 'admin' | 'guest' | null;

interface AuthUser {
  code: string;
  email: string | null;
  address: string;
  idCard: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (code: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
}

// Auth service with cookie storage instead of localStorage
const authService = {
  login: async ({ code, password }: { code: string; password: string }) => {
    const response = await fetch('https://frbr.vdc.services:40112/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return await response.json();
  },

  saveSession: (data: any) => {
    Cookies.set('token', data.token, { 
      expires: 3, 
      secure: window.location.protocol === 'https:', 
      sameSite: 'strict' 
    });
  
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Store all response data in localStorage for complete access
    localStorage.setItem('authData', JSON.stringify(data));
    
    // Also store token in localStorage for easier access across pages
    localStorage.setItem('token', data.token);
    
    // Console log the saved data
    console.log('Auth data saved to localStorage:', data);
    console.log('User data:', data.user);
    console.log('Token:', data.token);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      // Add default role if not provided by API
      if (!user.role) {
        user.role = 'staff';
      }
      return user;
    } catch (e) {
      return null;
    }
  },

  getToken: () => {
    return Cookies.get('token');
  },

  logout: () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authData');
    localStorage.removeItem('token');
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    
    if (user && token) {
      setUser(user);
      setUserRole((user.role as UserRole) || 'staff');
      console.log('Session restored from storage:', user);
    } else if (user && !token) {
      // Clean up if token is missing but user data exists
      authService.logout();
    }
    
    setIsLoading(false);
  }, []);

  const login = async (code: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ code, password });
      authService.saveSession(response);
      
      const userData = {
        ...response.user,
        role: 'staff'
      };
      
      setUser(userData);
      setUserRole('staff');
      
      console.log('Login successful:', userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: 'Invalid code or password',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    setUserRole('guest');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserRole(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      isAuthenticated: !!user || userRole === 'guest',
      isLoading,
      login,
      loginAsGuest,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}