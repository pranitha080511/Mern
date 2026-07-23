export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(endpoint, config);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If response body is empty or not JSON
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return null;
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  },

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};
export default api;
