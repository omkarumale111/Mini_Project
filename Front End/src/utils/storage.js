/**
 * Storage utility to manage user session data
 * Uses sessionStorage to isolate sessions per tab, allowing multiple users
 * to be logged in simultaneously in different tabs
 */

const STORAGE_KEY = 'user';

export const storage = {
  /**
   * Get user data from session storage
   * @returns {Object|null} User object or null if not found
   */
  getUser: () => {
    try {
      const userData = sessionStorage.getItem(STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error reading user data from storage:', error);
      return null;
    }
  },

  /**
   * Save user data to session storage
   * @param {Object} user - User object to save
   */
  setUser: (user) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data to storage:', error);
    }
  },

  /**
   * Remove user data from session storage
   */
  removeUser: () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error removing user data from storage:', error);
    }
  },

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn: () => {
    return storage.getUser() !== null;
  }
};
