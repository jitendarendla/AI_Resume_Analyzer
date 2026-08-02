'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface RecruiterUser {
  id: string;
  recruiter_id?: string;
  email: string;
  name: string;
  full_name?: string;
  company?: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: RecruiterUser | null;
  token: string | null;
  loginUser: (tokenData: any) => void;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  registerUser: (name: string, email: string, company: string, password: string) => Promise<any>;
  logoutUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loginUser: () => {},
  loginWithEmail: async () => {},
  registerUser: async () => {},
  logoutUser: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<RecruiterUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('recruiter');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          ...parsed,
          full_name: parsed.full_name || parsed.name
        });
      } catch (e) {
        console.error('Failed to parse recruiter user');
      }

      // Verify current token and fetch fresh profile from PostgreSQL backend
      api.get('/api/auth/me', { headers: { Authorization: `Bearer ${storedToken}` } })
        .then((res) => {
          if (res.data) {
            const freshUser = {
              ...res.data,
              full_name: res.data.name || res.data.full_name
            };
            setUser(freshUser);
            localStorage.setItem('recruiter', JSON.stringify(freshUser));
          }
        })
        .catch(() => {
          console.warn('Session expired or invalid');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginUser = (tokenData: any) => {
    if (tokenData.access_token) {
      const u = tokenData.user || {
        id: tokenData.recruiter_id,
        recruiter_id: tokenData.recruiter_id,
        email: tokenData.email,
        name: tokenData.name,
        full_name: tokenData.name,
        company: tokenData.company,
        is_admin: tokenData.is_admin,
      };
      const formattedUser = {
        ...u,
        full_name: u.name || u.full_name || 'Recruiter'
      };
      localStorage.setItem('token', tokenData.access_token);
      localStorage.setItem('recruiter', JSON.stringify(formattedUser));
      setToken(tokenData.access_token);
      setUser(formattedUser);
    }
    router.push('/dashboard');
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password: password,
      });

      if (response.data && response.data.access_token) {
        loginUser(response.data);
        return response.data;
      }
    } catch (err: any) {
      console.error('Native JWT Login Error:', err);
      throw new Error(err.response?.data?.detail || 'Invalid email address or password credentials.');
    }
  };

  const registerUser = async (name: string, email: string, company: string, password: string) => {
    try {
      const response = await api.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || 'Recruitment Agency',
        password: password,
      });

      if (response.data) {
        // Auto log in after successful registration
        await loginWithEmail(email, password);
        return response.data;
      }
    } catch (err: any) {
      console.error('Native JWT Register Error:', err);
      throw new Error(err.response?.data?.detail || 'Registration failed. Recruiter email may already be registered.');
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('recruiter');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loginUser, 
      loginWithEmail, 
      registerUser, 
      logoutUser, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
