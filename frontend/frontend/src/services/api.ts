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

// Category interface
export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Category creation/update interface
export interface CategoryFormData {
  name: string;
  description?: string;
}

// Strict JWT token validation
const isValidJWT = (token: string | null | undefined): token is string => {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }

  // Remove any surrounding quotes or angle brackets that might have been accidentally added
  const cleanToken = token.replace(/^["'`]|["'`]$/g, '').replace(/^<|>$/g, '').trim();

  // Must be a non-empty string after cleaning
  if (cleanToken.length === 0) {
    return false;
  }

  // JWT should have exactly 3 parts separated by dots
  const parts = cleanToken.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Each part should be base64url encoded (contains only valid base64url characters)
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64UrlRegex.test(part) && part.length > 0);
};

// Clean and validate token before storage
const cleanToken = (token: string | null | undefined): string | null => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  // Remove any surrounding quotes, angle brackets, or whitespace
  const cleaned = token.replace(/^["'`]|["'`]$/g, '').replace(/^<|>$/g, '').trim();

  return isValidJWT(cleaned) ? cleaned : null;
};

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
    const token = getToken();
    if (token && isValidJWT(token)) {
      // Ensure clean token format for Authorization header
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
      clearToken();
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
  getAll: async (category?: string): Promise<News[]> => {
    const params: any = {};
    if (category) {
      params.category = category;
    }
    const response = await api.get('/news', { params });
    // Handle different response structures for better error resilience
    if (response.data?.data?.news) {
      return response.data.data.news;
    }
    // Fallback for different response structures
    if (response.data?.news) {
      return response.data.news;
    }
    // Direct array response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If no news data found, return empty array
    console.warn('Unexpected API response structure:', response.data);
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

// Category API calls
export const categoryAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    // Handle different response structures for better error resilience
    if (response.data?.data?.categories) {
      return response.data.data.categories;
    }
    // Fallback for different response structures
    if (response.data?.categories) {
      return response.data.categories;
    }
    // Direct array response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If no categories data found, return empty array
    console.warn('Unexpected API response structure:', response.data);
    return [];
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  create: async (formData: CategoryFormData): Promise<Category> => {
    const response = await api.post('/categories', formData);
    return response.data.data;
  },

  update: async (id: string, formData: CategoryFormData): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, formData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return isValidJWT(token);
};

// Helper function to get valid token
export const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  return cleanToken(token);
};

// Helper function to set token (with validation and cleaning)
export const setToken = (token: string | null | undefined): void => {
  const cleanedToken = cleanToken(token);

  if (!cleanedToken) {
    console.error('Invalid or missing token provided to setToken:', token);
    clearToken();
    throw new Error('Invalid token format');
  }

  // Store the clean token
  localStorage.setItem('token', cleanedToken);
};

// Helper function to clear token
export const clearToken = (): void => {
  localStorage.removeItem('token');
};

// Helper function to get backend base URL for media files
export const getBackendBaseUrl = (): string => {
  // In development, images are proxied through Vite
  // In production, uploads are served from the same domain via Nginx reverse proxy
  return '';
};

export default api;
