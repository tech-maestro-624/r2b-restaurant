import axios from 'axios';
import { handleApiError } from './error-handler';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  // baseURL : 'https://r2bserver.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    // 'ngrok-skip-browser-warning': 'true',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  },
  timeout: 15000, // Increased timeout
});
// Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.code === 'ECONNABORTED') {
//       handleApiError(new Error('Request timed out. Please try again.'), 'Connection timeout');
//       return Promise.reject(error);
//     }

//     if (!error.response) {
//       handleApiError(new Error('Network connection failed. Please check your internet connection.'), 'Network Error');
//       return Promise.reject(error);
//     }

//     // Handle 401 errors
//     if (error.response?.status === 401) {
//       // Clear stored auth data
//       localStorage.removeItem('restaurant_admin_user');
//       localStorage.removeItem('phoneNumber');
      
//       // Only redirect to login if not already on login or verify-otp page
//       const currentPath = window.location.pathname;
//       if (!['/login', '/verify-otp'].includes(currentPath)) {
//         window.location.href = '/login';
//       }
//       return Promise.reject(error);
//     }

//     // Don't show error notification for auth check
//     if (!error.config?.url?.includes('/auth/me')) {
//       handleApiError(error, 'Request failed');
//     }

//     return Promise.reject(error);
//   }
// );

export default api;