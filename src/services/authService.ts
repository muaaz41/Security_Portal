
import { simulateRequest, simulateError } from '../utils/api';

// Mock user database
const USERS = [
  {
    id: "1",
    email: "admin@securityportal.com",
    password: "password", // In a real app, passwords would be hashed
    name: "Admin User",
    role: "admin"
  },
  {
    id: "2",
    email: "security@securityportal.com",
    password: "security123",
    name: "Security Officer",
    role: "staff"
  }
];

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const user = USERS.find(u => 
      u.email === credentials.email && 
      u.password === credentials.password
    );
    
    if (!user) {
      return simulateError('Invalid email or password');
    }
    
    // Simulate JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    return simulateRequest({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  },
  
  /**
   * Process guest check-in (no authentication required)
   */
  async guestCheckIn(guestData: any): Promise<{ success: boolean, message: string }> {
    // Validate the guest data here if needed
    console.log('Processing guest check-in:', guestData);
    
    // Always succeed in this mock version
    return simulateRequest({
      success: true,
      message: "Guest check-in successful. Host has been notified."
    });
  },
  
  /**
   * Store auth data in local storage
   */
  saveSession(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('auth_user', JSON.stringify(authResponse.user));
  },
  
  /**
   * Get current auth user from local storage
   */
  getCurrentUser(): { id: string; email: string; name: string; role: string } | null {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
  
  /**
   * Remove auth data from local storage
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
};
