'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface RecruiterUser {
  recruiter_id: string;
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
        const u = JSON.parse(storedUser);
        setUser({
          ...u,
          full_name: u.full_name || u.name
        });
      } catch (e) {
        console.error('Failed to parse recruiter user');
      }
    } else {
      const publicPaths = ['/', '/login', '/register', '/forgot-password'];
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
    }
    setIsLoading(false);
  }, [pathname, router]);

  const loginUser = (data: any) => {
    setToken(data.access_token);
    const userInfo: RecruiterUser = {
      recruiter_id: data.recruiter_id,
      email: data.email,
      name: data.name || data.full_name || 'Recruiter',
      full_name: data.full_name || data.name || 'Recruiter',
      company: data.company,
      is_admin: data.is_admin || false,
    };
    setUser(userInfo);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('recruiter', JSON.stringify(userInfo));
    router.push('/dashboard');
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('recruiter');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
