// src/services/api.js
// Complete API service with routes endpoint

const API_BASE_URL = 'https://backoffice.khulnatravels.net/api/v1';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = options.body;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('🚀 API Request:', { url, method: config.method });

  try {
    const response = await fetch(url, config);
    console.log('📥 Response Status:', response.status);
    
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      throw new Error('Invalid JSON response');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    register: async (userData) => {
      return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    login: async (credentials) => {
      return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    logout: async () => {
      return apiRequest('/auth/logout', {
        method: 'POST',
      });
    },

    me: async () => {
      return apiRequest('/auth/me');
    },
  },

  // Routes (NEW!)
  routes: {
    // Get all routes
    getAll: async () => {
      return apiRequest('/road');
    },

    // Search routes by from/to
    search: async (from, to) => {
      return apiRequest(`/road?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    },

    // Get unique FROM locations
    getFromLocations: async () => {
      try {
        const routes = await apiRequest('/road');
        // Extract unique FROM locations
        const fromLocations = [...new Set(routes.map(route => route.from))];
        return fromLocations.sort();
      } catch (error) {
        console.error('Error getting FROM locations:', error);
        return [];
      }
    },

    // Get TO locations for a specific FROM
    getToLocations: async (from) => {
      try {
        const routes = await apiRequest('/road');
        // Filter routes by FROM and extract TO locations
        const toLocations = routes
          .filter(route => route.from === from)
          .map(route => route.to);
        return [...new Set(toLocations)].sort();
      } catch (error) {
        console.error('Error getting TO locations:', error);
        return [];
      }
    },

    // Get route details
    getRoute: async (from, to) => {
      try {
        const routes = await apiRequest('/road');
        return routes.find(route => route.from === from && route.to === to);
      } catch (error) {
        console.error('Error getting route:', error);
        return null;
      }
    },
  },

  // Buses
  buses: {
    getAll: async () => {
      return apiRequest('/buses');
    },

    search: async (params) => {
      return apiRequest('/buses/search', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
  },

  // Bookings
  bookings: {
    create: async (bookingData) => {
      return apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    },

    getAll: async () => {
      return apiRequest('/bookings');
    },

    getById: async (id) => {
      return apiRequest(`/bookings/${id}`);
    },
  },
};

export default api;

// Helper functions for backward compatibility
export const getBuses = () => api.buses.getAll();
export const getRoutes = () => api.routes.getAll();