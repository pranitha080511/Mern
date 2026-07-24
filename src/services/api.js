const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  return 'https://mern-oknu.onrender.com';
};

const rawUrl = getBaseUrl();
const BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === "object" && !isFormData) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    let data;

    try {
      data = await response.json();
    } catch (e) {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return null;
    }

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  },

  get(endpoint, options) {
    return this.request(endpoint, {
      ...options,
      method: "GET",
    });
  },

  post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body,
    });
  },

  put(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body,
    });
  },

  delete(endpoint, options) {
    return this.request(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};

export default api;