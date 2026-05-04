export const API_BASE_URL = 'http://localhost:8000/api';

// Get auth token from localStorage (optional for public endpoints)
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token') || null;
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Add authorization header only if token exists
  const token = getAuthToken();
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// College API functions
export const collegeAPI = {
  // Get all colleges
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/superadmin/colleges${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get college by ID
  getById: (id) => {
    return apiRequest(`/superadmin/colleges/${id}`);
  },

  // Create new college
  create: (collegeData) => {
    return apiRequest('/superadmin/colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData)
    });
  },

  // Update college
  update: (id, collegeData) => {
    return apiRequest(`/superadmin/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collegeData)
    });
  },

  // Delete college
  delete: (id) => {
    return apiRequest(`/superadmin/colleges/${id}`, {
      method: 'DELETE'
    });
  },

  // Get college statistics
  getStats: () => {
    return apiRequest('/superadmin/colleges/stats');
  }
};

// User API functions
export const userAPI = {
  // Get all users
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/superadmin/users${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get user by ID
  getById: (id) => {
    return apiRequest(`/superadmin/users/${id}`);
  },

  // Create new user
  create: (userData) => {
    return apiRequest('/superadmin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Update user (routes to correct endpoint based on role)
  update: (id, userData, role = 'student') => {
    let endpoint = '';
    let method = 'PUT';

    if (role === 'admin') {
      endpoint = `/admin/${id}`;
      method = 'PUT';
    } else if (role === 'student') {
      endpoint = `/student/${id}`;
      method = 'PATCH';
    } else {
      endpoint = `/superadmin/${id}`;
      method = 'PUT';
    }

    return apiRequest(endpoint, {
      method: method,
      body: JSON.stringify(userData)
    });
  },

  // Delete user (routes to correct endpoint based on role)
  delete: (id, role = 'student') => {
    let endpoint = '';

    if (role === 'admin') {
      endpoint = `/admin/${id}`;
    } else if (role === 'student') {
      endpoint = `/student/${id}`;
    } else {
      endpoint = `/superadmin/${id}`;
    }

    return apiRequest(endpoint, {
      method: 'DELETE'
    });
  },

  // Get user statistics
  getStats: () => {
    return apiRequest('/superadmin/users/stats');
  },

  // Get current superadmin profile
  getSuperAdminProfile: () => {
    return apiRequest('/users/superadmin/profile/me');
  },

  // Update current superadmin profile (handles FormData for file uploads)
  updateSuperAdminProfile: (profileData) => {
    // Handle FormData for file uploads
    if (profileData instanceof FormData) {
      const token = getAuthToken();
      return fetch(`${API_BASE_URL}/users/superadmin/profile/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: profileData
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
      });
    }
    // Regular JSON update
    return apiRequest('/users/superadmin/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
};

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard counts (colleges, courses, users)
  getCounts: () => {
    return apiRequest('/superadmin/count');
  },

  // Get application statistics
  getApplicationStats: () => {
    return apiRequest('/applications/stats');
  },

  // Get daily statistics for chart (last 7 days)
  getDailyStats: () => {
    return apiRequest('/applications/stats/daily');
  },

  getAggregatePercentage: (token) => {
    return apiRequest('/get', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

// Course API functions (for superAdmin to get all courses)
export const courseAPI = {
  // Get all courses (for superAdmin)
  getAll: () => {
    return apiRequest('/courses');
  },

  // Get course by ID
  getById: (id) => {
    return apiRequest(`/courses/${id}`);
  }
};

// Mock authentication for testing (remove in production)
export const mockLogin = () => {
  const mockToken = 'mock-jwt-token-for-testing';
  setAuthToken(mockToken);
  return mockToken;
};

export default apiRequest;
