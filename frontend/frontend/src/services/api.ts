import axios from 'axios';

// News interface matching backend model
export interface News {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  videoFileUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Login interface
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

// News creation/update interface
export interface NewsFormData {
  title: string;
  description: string;
  category: string;
  image?: File;
  videoUrl?: string;
  isPublished: boolean;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token (only if valid)
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // getToken() now validates the token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Ensure no Authorization header is present for invalid/missing tokens
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear localStorage and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }

    // Handle network errors or server unavailable
    if (!error.response) {
      console.error('Network error or server unavailable:', error.message);
      // Create a custom error for network issues
      const networkError = {
        ...error,
        message: 'Unable to connect to server. Please check your internet connection and try again.',
        isNetworkError: true
      };
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// News API calls
export const newsAPI = {
  getAll: async (): Promise<News[]> => {
    const response = await api.get('/news');
    // Handle different response structures for better error resilience
    if (response.data?.data?.news) {
      return response.data.data.news;
    }
    // Fallback for different response structures
    if (response.data?.news) {
      return response.data.news;
    }
    // If no news data found, return empty array
    return [];
  },

  getById: async (id: string): Promise<News> => {
    const response = await api.get(`/news/${id}`);
    return response.data.data;
  },

  create: async (formData: FormData): Promise<News> => {
    const response = await api.post('/news', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  update: async (id: string, formData: FormData): Promise<News> => {
    const response = await api.put(`/news/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/news/${id}`);
  },
};

// Helper function to validate JWT token format
export const isValidToken = (token: string | null): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Remove any surrounding quotes that might have been accidentally added
  const cleanToken = token.replace(/^["']|["']$/g, '');

  // Basic JWT structure validation: should have 3 parts separated by dots
  const parts = cleanToken.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Check if all parts are base64-like (contain only valid base64 characters)
  const base64Regex = /^[A-Za-z0-9-_]+$/;
  return parts.every(part => base64Regex.test(part));
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return isValidToken(token);
};

// Helper function to get valid token
export const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  return isValidToken(token) ? token : null;
};

// Helper function to set token (with validation)
export const setToken = (token: string | undefined): void => {
  if (!token || !isValidToken(token)) {
    console.error('Invalid or missing token provided to setToken:', token);
    throw new Error('Invalid token format');
  }

  // Remove any surrounding quotes that might have been accidentally added
  const cleanToken = token.replace(/^["']|["']$/g, '');
  localStorage.setItem('token', cleanToken);
};

// Helper function to clear token
export const clearToken = (): void => {
  localStorage.removeItem('token');
};

// Helper function to get backend base URL for media files
export const getBackendBaseUrl = (): string => {
  // In production, uploads are served from the same domain via Nginx reverse proxy
  return '';
};

export default api;
