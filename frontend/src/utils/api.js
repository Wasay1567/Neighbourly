import axios from 'axios';
import { API_URL } from '../conf/conf';

const api = axios.create({
  baseURL: API_URL,
});

//automatically add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;