import axios from 'axios';
import { SignupData, SigninData } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to signin page
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendSignupOTP: (data: { email: string; fullName: string; dateOfBirth: string }) =>
    api.post('/auth/signup/send-otp', data),

  verifySignupOTP: (data: SignupData) => api.post('/auth/signup/verify-otp', data),

  sendSigninOTP: (data: { email: string }) => api.post('/auth/signin/send-otp', data),

  verifySigninOTP: (data: SigninData) => api.post('/auth/signin/verify-otp', data),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get('/auth/profile'),
};

// Notes API
export const notesAPI = {
  getNotes: () => api.get('/notes'),

  createNote: (data: { title: string; content: string }) => api.post('/notes', data),

  updateNote: (id: string, data: { title: string; content: string }) =>
    api.put(`/notes/${id}`, data),

  deleteNote: (id: string) => api.delete(`/notes/${id}`),
};

export default api;
