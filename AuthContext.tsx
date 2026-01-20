import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'production'
      ? 'https://resumyx-api.onrender.com/api'
      : 'http://localhost:8000/api');

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            // Token is valid
            setSession({
              access_token: storedToken,
              refresh_token: storedRefreshToken || '',
              expires_at: 0
            });
            setUser(JSON.parse(storedUser));
          } else {
            // Token expired, try to refresh
            if (storedRefreshToken) {
              await refreshToken(storedRefreshToken);
            } else {
              // Can't refresh, clear session
              clearSession();
            }
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          clearSession();
        }
      }

      setLoading(false);
    };

    loadSession();
  }, []);

  const refreshToken = async (refresh_token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token })
      });

      if (response.ok) {
        const data = await response.json();
        const newSession: AuthSession = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at
        };

        setSession(newSession);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        return true;
      } else {
        clearSession();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearSession();
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();

      const newUser: User = {
        id: data.user.id,
        email: data.user.email
      };

      const newSession: AuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      };

      setUser(newUser);
      setSession(newSession);

      // Store in localStorage
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
      localStorage.setItem('user', JSON.stringify(newUser));

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();

      // If email confirmation is disabled, we get a session immediately
      if (data.session) {
        const newUser: User = {
          id: data.user.id,
          email: data.user.email
        };

        const newSession: AuthSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        };

        setUser(newUser);
        setSession(newSession);

        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        // Email confirmation required
        throw new Error(data.message || 'Please check your email to confirm your account');
      }

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearSession();
    // Optionally call backend logout endpoint
    if (session?.access_token) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      }).catch(console.error);
    }
  };

  const clearSession = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
