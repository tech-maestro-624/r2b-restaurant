import api from '../utils/axios';
import { User } from '../types/auth';

export const authService = {
  login: (phoneNumber: string) => 
    api.post('/login', { phoneNumber }),

  verifyOTP: (otp: string, phoneNumber: string) =>
    api.post<{ user: User }>('/verify-login', { otp, phoneNumber }),

  logout: () => 
    api.post('/logout'),

  checkAuth: () =>
    api.get<{ user: User }>('/auth/me'),
};