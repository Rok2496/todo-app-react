/**
 * API utilities for the Todo application
 */

/**
 * Formats error messages from API responses
 * @param {Error} error - The error object from an API call
 * @returns {string} Formatted error message
 */
export const formatApiError = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data, status } = error.response;
    
    if (data && data.message) {
      return data.message;
    }
    
    if (status === 401) {
      return 'Unauthorized. Please log in again.';
    }
    
    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (status === 404) {
      return 'Resource not found.';
    }
    
    if (status === 500) {
      return 'Server error. Please try again later.';
    }
    
    return `Error: ${status}`;
  }
  
  if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your connection.';
  }
  
  // Something happened in setting up the request that triggered an Error
  return error.message || 'An error occurred. Please try again.';
};

/**
 * Creates query parameters string from an object
 * @param {Object} params - Object containing query parameters
 * @returns {string} Formatted query string
 */
export const createQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return '';
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}; 