import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create a separate instance for Google API calls
const googleApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
googleApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simplified Google service
const googleService = {
  // Check if Google is connected
  checkConnection: async () => {
    try {
      const response = await googleApi.get('/users/me');
      return response.data.google_connected === true;
    } catch (error) {
      console.error('Error checking Google connection:', error);
      return false;
    }
  },

  // Get Google authorization URL and handle various response formats
  getAuthUrl: async () => {
    try {
      console.log('Requesting Google auth URL...');
      const response = await googleApi.get('/auth/google/authorize');
      console.log('Full response:', response);
      
      if (response.data) {
        if (typeof response.data === 'string') {
          // If response is directly a string URL
          return response.data;
        }
        else if (response.data.authorization_url) {
          // If response has authorization_url property
          return response.data.authorization_url;
        }
      }
      
      throw new Error('Could not extract authorization URL from response');
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
      throw error;
    }
  },

  // Disconnect Google integration
  disconnect: async () => {
    try {
      await googleApi.post('/users/google/disconnect');
      return true;
    } catch (error) {
      console.error('Error disconnecting Google:', error);
      throw error;
    }
  },

  // Add a todo to Google Calendar
  addToCalendar: async (todoId) => {
    try {
      const response = await googleApi.post('/todos/calendar/add', null, {
        params: { todo_id: todoId }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to calendar:', error);
      throw error;
    }
  }
};

export default googleService; 