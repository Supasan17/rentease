/**
 * Axios API Client
 *
 * Shared axios instance for talking to the RentEase API. The base URL comes
 * from VITE_API_URL, and the saved JWT is sent as a Bearer token on every
 * request.
 */

import axios from 'axios';

export const TOKEN_KEY = 'rentease_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT from localStorage to each outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Pull a readable error message out of an axios error.
 * Handles the server's { message } errors and express-validator { errors } lists.
 */
export const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((err) => err.msg || err.message).join(', ');
  }
  return data?.message || error.message || 'Something went wrong';
};

export default api;
