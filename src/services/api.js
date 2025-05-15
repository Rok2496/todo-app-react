import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication service
export const authService = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  setup2FA: async () => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },
  
  verify2FA: async (otp) => {
    const response = await api.post('/auth/2fa/verify', { otp });
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },
  
  requestOneTimeLogin: async (email) => {
    console.log('Requesting one-time login for email:', email);
    const response = await api.post('/auth/onetime/request', { email });
    console.log('One-time login response:', response.data);
    return response.data;
  },
  
  verifyOneTimeLogin: async (token) => {
    const response = await api.post('/auth/onetime/verify', { token });
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },
  
  verifyOneTimeCode: async (email, code) => {
    const response = await api.post('/auth/onetime/verify', { email, code });
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

// Todo service
export const todoService = {
  getAllTodos: async () => {
    const response = await api.get('/todos');
    return response.data;
  },
  
  getTodoById: async (id) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },
  
  createTodo: async (todoData) => {
    const response = await api.post('/todos', todoData);
    return response.data;
  },
  
  updateTodo: async (id, todoData) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },
  
  deleteTodo: async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },
  
  addToCalendar: async (id) => {
    try {
      const response = await api.post('/todos/calendar/add', null, {
        params: { todo_id: id }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to calendar:', error);
      checkAuthAndRedirect(error);
      throw error;
    }
  }
};

// Function to check token and redirect to login if needed
const checkAuthAndRedirect = (error) => {
  if (error.response && error.response.status === 401) {
    console.error('Authentication failed - redirecting to login');
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
    return true;
  }
  return false;
};

// Google integration service - Using the actual backend endpoints
export const googleService = {
  checkConnection: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data.google_connected === true;
    } catch (error) {
      console.error('Error checking Google connection:', error);
      checkAuthAndRedirect(error);
      return false;
    }
  },
  
  connectGoogle: async () => {
    try {
      // Log before making the request
      console.log('Making request to /auth/google/authorize');
      
      const response = await api.get('/auth/google/authorize');
      
      // Log the raw response
      console.log('Raw response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', response.data);
      
      // Direct return of the URL regardless of format
      if (response.data && typeof response.data === 'object' && response.data.authorization_url) {
        // Object with authorization_url property
        console.log('Found authorization_url property, returning:', response.data.authorization_url);
        return response.data.authorization_url;
      } else if (typeof response.data === 'string' && response.data.includes('accounts.google.com')) {
        // Direct string URL
        console.log('Found direct URL string, returning:', response.data);
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find any URL-like property in the response
        const allProps = Object.entries(response.data);
        console.log('Examining all properties:', allProps);
        
        for (const [key, value] of allProps) {
          if (typeof value === 'string' && value.includes('accounts.google.com')) {
            console.log(`Found URL in property ${key}, returning:`, value);
            return value;
          }
        }
        
        // Last resort, try to stringify the object
        const dataStr = JSON.stringify(response.data);
        console.error('Could not find URL in response, full data:', dataStr);
        throw new Error(`Could not find authorization URL in response: ${dataStr.substring(0, 100)}...`);
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Unexpected response format from authorization endpoint');
      }
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      checkAuthAndRedirect(error);
      throw error;
    }
  },
  
  disconnectGoogle: async () => {
    try {
      const response = await api.post('/users/google/disconnect');
      return response.data;
    } catch (error) {
      console.error('Error disconnecting Google:', error);
      checkAuthAndRedirect(error);
      throw error;
    }
  }
};

// User service - Using the actual backend endpoint
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    // This endpoint isn't in the API docs, but we'll keep it for future use
    console.log('Profile update not implemented in backend:', userData);
    return userData;
  }
};

export default api; 