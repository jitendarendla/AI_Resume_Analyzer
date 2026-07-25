import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const envUrl = process.env.NEXT_PUBLIC_API_URL.trim();
    if (envUrl && envUrl !== '/' && !envUrl.includes('ai-resume-analyzer-backend.onrender.com')) {
      return envUrl;
    }
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('onrender.com') || hostname.includes('render.com') || hostname.includes('vercel.app')) {
      return '';
    }
    if (hostname.includes('loca.lt') || hostname.includes('ngrok') || hostname.includes('tunnel')) {
      return 'https://plain-readers-make.loca.lt';
    }
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8000`;
    }
  }
  return 'http://127.0.0.1:8000';
};

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        if (config.headers.set) {
          config.headers.set('Authorization', `Bearer ${token}`);
          config.headers.set('bypass-tunnel-reminder', 'true');
        } else {
          config.headers['Authorization'] = `Bearer ${token}`;
          config.headers['bypass-tunnel-reminder'] = 'true';
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && !currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/forgot-password')) {
          localStorage.removeItem('token');
          localStorage.removeItem('recruiter');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
