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
  avatar_url?: string;
}

interface AuthContextType {
  user: RecruiterUser | null;
  token: string | null;
  loginUser: (tokenData: any) => void;
  logoutUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loginUser: () => {},
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

      // Refresh current user profile from backend
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
          // Token expired or invalid
          console.warn('Session expired');
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
      const u = tokenData.user || {};
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

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('recruiter');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
