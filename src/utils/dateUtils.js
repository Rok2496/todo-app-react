/**
 * Date utilities for the Todo application
 */

import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';

/**
 * Format a date string into a human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(parseISO(dateString), 'MMM dd, yyyy');
};

/**
 * Format a datetime string into a human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return format(parseISO(dateString), 'MMM dd, yyyy h:mm a');
};

/**
 * Get a relative date description (Today, Tomorrow, etc.)
 * @param {string} dateString - ISO date string
 * @returns {string} Relative date description
 */
export const getRelativeDate = (dateString) => {
  if (!dateString) return '';
  
  const date = parseISO(dateString);
  
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
  
  return format(date, 'MMM dd, yyyy');
}; 