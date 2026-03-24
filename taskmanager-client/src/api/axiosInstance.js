import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let authTokenGetter = null;
let onUnauthorized = null;

export const setAuthTokenGetter = (getter) => {
  authTokenGetter = getter;
};

export const setOnUnauthorized = (callback) => {
  onUnauthorized = callback;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = authTokenGetter?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
