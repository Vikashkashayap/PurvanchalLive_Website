import axios from 'axios';
import { requestManager } from './requestManager';

// News interface matching backend model
export interface News {
  _id: string;
  title: string;
  shortDescription?: string;
  description: string;
  category: string;
  slug?: string;
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
  shortDescription?: string;
  description: string;
  category: string;
  image?: File;
  videoUrl?: string;
  slug?: string;
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

// Marquee Content interface
export interface MarqueeContent {
  _id: string;
  content: string;
  type: 'breaking' | 'announcement';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface NewsListResponse {
  news: News[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Marquee Content creation/update interface
export interface MarqueeContentFormData {
  content: string;
  type: 'breaking' | 'announcement';
  isActive?: boolean;
  order?: number;
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
  getAll: async (category?: string, page?: number, limit?: number): Promise<{news: News[], pagination: {page: number, limit: number, total: number, pages: number}}> => {
    const params: any = {};
    if (category && category !== 'All') {
      params.category = category;
    }
    if (page) {
      params.page = page;
    }
    if (limit) {
      params.limit = limit;
    }

    try {
      const response = await requestManager.request<ApiResponse<NewsListResponse>>('/api/news', {
        method: 'GET',
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken() ? `Bearer ${getToken()}` : undefined,
        }
      });

      // Handle the properly typed response
      if (response?.data) {
        return {
          news: response.data.news || [],
          pagination: response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
        };
      }
      // If no data found, return empty result
      console.warn('Unexpected API response structure:', response);
      return {
        news: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return empty result on error instead of throwing
      return {
        news: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      };
    }
  },

  getById: async (id: string): Promise<News> => {
    const response = await api.get(`/news/${id}`);
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<News> => {
    const response = await api.get(`/news/slug/${slug}`);
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

export const marqueeAPI = {
  getAll: async (type?: 'breaking' | 'announcement'): Promise<MarqueeContent[]> => {
    const params: any = {};
    if (type) {
      params.type = type;
    }

    try {
      const response = await requestManager.request<ApiResponse<MarqueeContent[]>>('/api/marquee', {
        method: 'GET',
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken() ? `Bearer ${getToken()}` : undefined,
        }
      });

      return response?.data || [];
    } catch (error) {
      console.error('Error fetching marquee content:', error);
      // Return empty array on error
      return [];
    }
  },

  // Helper method to get both breaking and announcement content efficiently
  getAllContent: async (): Promise<{ breaking: MarqueeContent[], announcements: MarqueeContent[] }> => {
    try {
      // Use request manager to fetch both types - this will deduplicate if called multiple times
      const [breakingResponse, announcementResponse] = await Promise.all([
        requestManager.request<ApiResponse<MarqueeContent[]>>('/api/marquee', {
          method: 'GET',
          params: { type: 'breaking' },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken() ? `Bearer ${getToken()}` : undefined,
          }
        }),
        requestManager.request<ApiResponse<MarqueeContent[]>>('/api/marquee', {
          method: 'GET',
          params: { type: 'announcement' },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken() ? `Bearer ${getToken()}` : undefined,
          }
        })
      ]);

      return {
        breaking: breakingResponse?.data || [],
        announcements: announcementResponse?.data || []
      };
    } catch (error) {
      console.error('Error fetching marquee content:', error);
      // Return empty arrays on error
      return { breaking: [], announcements: [] };
    }
  },

  create: async (data: MarqueeContentFormData): Promise<MarqueeContent> => {
    const response = await api.post('/marquee', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<MarqueeContentFormData>): Promise<MarqueeContent> => {
    const response = await api.put(`/marquee/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/marquee/${id}`);
  },
};

// Category API calls
export const categoryAPI = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await requestManager.request<ApiResponse<CategoryListResponse>>('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken() ? `Bearer ${getToken()}` : undefined,
        }
      });

      // Handle the properly typed response
      if (response?.data?.categories) {
        return response.data.categories;
      }
      // If no categories data found, return empty array
      console.warn('Unexpected API response structure:', response);
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return fallback categories on error
      return [
        { _id: '1', name: 'ग्राम समाचार', description: '', createdAt: '', updatedAt: '' },
        { _id: '2', name: 'राजनीति', description: '', createdAt: '', updatedAt: '' },
        { _id: '3', name: 'शिक्षा', description: '', createdAt: '', updatedAt: '' },
        { _id: '4', name: 'मौसम', description: '', createdAt: '', updatedAt: '' },
        { _id: '5', name: 'स्वास्थ्य', description: '', createdAt: '', updatedAt: '' },
        { _id: '6', name: 'कृषि', description: '', createdAt: '', updatedAt: '' },
        { _id: '7', name: 'मनोरंजन', description: '', createdAt: '', updatedAt: '' },
        { _id: '8', name: 'अन्य', description: '', createdAt: '', updatedAt: '' },
      ];
    }
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
