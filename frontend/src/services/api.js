import axios from 'axios';

// Detecta automaticamente o ambiente
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000' 
  : 'https://reservaon-lv6w.onrender.com';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;