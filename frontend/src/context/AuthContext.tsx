'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

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
  loginWithGoogle: () => Promise<any>;
  loginWithFirebaseEmail: (email: string, password: string) => Promise<any>;
  registerWithFirebaseEmail: (email: string, password: string, name: string, company: string) => Promise<any>;
  logoutUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loginUser: () => {},
  loginWithGoogle: async () => {},
  loginWithFirebaseEmail: async () => {},
  registerWithFirebaseEmail: async () => {},
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
    // Check for Firebase Google Redirect login result
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const gUser = result.user;
          const response = await api.post('/api/auth/google-login', {
            email: gUser.email,
            name: gUser.displayName || 'Google Recruiter',
            google_uid: gUser.uid,
            photo_url: gUser.photoURL || '',
          });

          if (response.data && response.data.access_token) {
            const recruiterObj = {
              id: response.data.recruiter_id,
              recruiter_id: response.data.recruiter_id,
              email: response.data.email,
              name: response.data.name,
              full_name: response.data.name,
              company: response.data.company || 'Google Account',
              is_admin: response.data.is_admin,
              avatar_url: gUser.photoURL || response.data.avatar_url || '',
            };

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('recruiter', JSON.stringify(recruiterObj));
            setToken(response.data.access_token);
            setUser(recruiterObj);
            router.push('/dashboard');
          }
        }
      })
      .catch((e) => {
        console.warn('Redirect auth check complete');
      });

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

      // Refresh current user profile from PostgreSQL backend
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
          console.warn('Session check complete');
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

  const loginWithFirebaseEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      const response = await api.post('/api/auth/google-login', {
        email: fbUser.email,
        name: fbUser.displayName || email.split('@')[0],
        google_uid: fbUser.uid,
        photo_url: fbUser.photoURL || '',
      });

      if (response.data && response.data.access_token) {
        const recruiterObj = {
          id: response.data.recruiter_id,
          recruiter_id: response.data.recruiter_id,
          email: response.data.email,
          name: response.data.name,
          full_name: response.data.name,
          company: response.data.company || 'Firebase Recruiter',
          is_admin: response.data.is_admin,
          avatar_url: fbUser.photoURL || '',
        };

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('recruiter', JSON.stringify(recruiterObj));
        setToken(response.data.access_token);
        setUser(recruiterObj);
        router.push('/dashboard');
        return recruiterObj;
      }
    } catch (err: any) {
      console.error('Firebase Email Login Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email address or password.');
      }
      throw new Error(err.message || 'Firebase authentication failed.');
    }
  };

  const registerWithFirebaseEmail = async (email: string, password: string, name: string, company: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      const response = await api.post('/api/auth/google-login', {
        email: fbUser.email,
        name: name || fbUser.displayName || email.split('@')[0],
        google_uid: fbUser.uid,
        photo_url: '',
      });

      if (response.data && response.data.access_token) {
        const recruiterObj = {
          id: response.data.recruiter_id,
          recruiter_id: response.data.recruiter_id,
          email: response.data.email,
          name: name || response.data.name,
          full_name: name || response.data.name,
          company: company || 'Firebase Recruiter',
          is_admin: response.data.is_admin,
        };

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('recruiter', JSON.stringify(recruiterObj));
        setToken(response.data.access_token);
        setUser(recruiterObj);
        router.push('/dashboard');
        return recruiterObj;
      }
    } catch (err: any) {
      console.error('Firebase Email Register Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('Email address is already registered in Firebase.');
      }
      throw new Error(err.message || 'Firebase account creation failed.');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      const response = await api.post('/api/auth/google-login', {
        email: gUser.email,
        name: gUser.displayName || 'Google Recruiter',
        google_uid: gUser.uid,
        photo_url: gUser.photoURL || '',
      });

      if (response.data && response.data.access_token) {
        const recruiterObj = {
          id: response.data.recruiter_id,
          recruiter_id: response.data.recruiter_id,
          email: response.data.email,
          name: response.data.name,
          full_name: response.data.name,
          company: response.data.company || 'Google Account',
          is_admin: response.data.is_admin,
          avatar_url: gUser.photoURL || response.data.avatar_url || '',
        };

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('recruiter', JSON.stringify(recruiterObj));
        setToken(response.data.access_token);
        setUser(recruiterObj);
        router.push('/dashboard');
        return recruiterObj;
      }
    } catch (err: any) {
      console.warn('Popup login fallback to Redirect mode:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your deployment domain';
        throw new Error(`Firebase Domain Authorization Required: Add '${currentDomain}' to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
      }
      
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr: any) {
        throw new Error(redirectErr.message || 'Google Sign In failed.');
      }
    }
  };

  const logoutUser = () => {
    try {
      firebaseSignOut(auth);
    } catch (e) {}
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
      loginWithGoogle, 
      loginWithFirebaseEmail, 
      registerWithFirebaseEmail, 
      logoutUser, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
