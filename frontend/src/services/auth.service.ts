import axios from 'axios';

const API_URL = '/api';

export default {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password
    });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    userType?: string;
    profile?: any;
  }) {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
}; 