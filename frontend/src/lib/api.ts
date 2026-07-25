import axios from 'axios';

const getApiBaseUrl = () => {
  let url = (process.env.NEXT_PUBLIC_API_URL || '').trim();

  // If URL not set or is root slash, calculate dynamically from browser window
  if (!url || url === '/') {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('onrender.com') || hostname.includes('render.com')) {
        url = hostname.replace('-frontend', '-backend');
      } else if (hostname.includes('loca.lt') || hostname.includes('ngrok') || hostname.includes('tunnel')) {
        url = 'https://plain-readers-make.loca.lt';
      } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        url = `http://${hostname}:8000`;
      } else {
        url = 'http://127.0.0.1:8000';
      }
    } else {
      url = 'http://127.0.0.1:8000';
    }
  }

  // Automatically append .onrender.com if Render service name lacks TLD
  if (url && !url.includes('.') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    url = `${url}.onrender.com`;
  } else if (url && url.includes('onrender') && !url.includes('.onrender.com') && !url.includes('localhost')) {
    url = `${url}.onrender.com`;
  }

  // Ensure proper protocol (https://)
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url.replace(/\/$/, '');
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
