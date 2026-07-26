'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';

interface RecruiterUser {
  recruiter_id: string;
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
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState<RecruiterUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const fullName = clerkUser.fullName || clerkUser.firstName || 'Recruiter';
      const cUser: RecruiterUser = {
        recruiter_id: clerkUser.id,
        email: email,
        name: fullName,
        full_name: fullName,
        company: (clerkUser.publicMetadata?.company as string) || 'Recruitment Agency',
        is_admin: true,
        avatar_url: clerkUser.imageUrl,
      };

      setUser(cUser);
      setToken(clerkUser.id);
      localStorage.setItem('token', clerkUser.id);
      localStorage.setItem('recruiter', JSON.stringify(cUser));
    } else {
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
        setUser(null);
        setToken(null);
      }
    }
    setIsLoading(false);
  }, [isLoaded, isSignedIn, clerkUser]);

  const loginUser = (tokenData: any) => {
    if (tokenData.access_token) {
      localStorage.setItem('token', tokenData.access_token);
      localStorage.setItem('recruiter', JSON.stringify(tokenData.user));
      setToken(tokenData.access_token);
      setUser(tokenData.user);
    } else if (tokenData.recruiter_id || tokenData.email) {
      localStorage.setItem('token', tokenData.recruiter_id || 'clerk_token');
      localStorage.setItem('recruiter', JSON.stringify(tokenData));
      setToken(tokenData.recruiter_id || 'clerk_token');
      setUser(tokenData);
    }
    router.push('/dashboard');
  };

  const logoutUser = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('recruiter');
    setUser(null);
    setToken(null);
    try {
      await signOut();
    } catch (e) {
      console.log('Signout complete');
    }
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
