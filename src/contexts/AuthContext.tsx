import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { authService } from '../services/auth.service';
import { User, AuthContextType } from '../types/auth';
import { handleApiError, isNetworkError, isAuthError } from '../utils/error-handler';

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'restaurant_admin_user';
const TOKEN_STORAGE_KEY = 'authToken';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        console.log('No token found, setting loading to false');
        setLoading(false);
        return;
      }
  
      try {
        const { data } = await authService.checkAuth();
        console.log('Auth check successful:', data);
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  
        // Redirect if authenticated but on login/verify-otp page
        if (['/login', '/verify-otp'].includes(location.pathname)) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isAuthError(error)) {
          logout(); // Automatically handle invalid tokens
        }
      } finally {
        setLoading(false);
      }
    };
  
    checkAuth();
  }, [navigate, location.pathname]);

  const login = async (phoneNumber: string) => {
    try {
      const { data } = await authService.login(phoneNumber);
      if (data.otp) {
        localStorage.setItem('autoFillOTP', data.otp);
      }
      localStorage.setItem('phoneNumber', phoneNumber);

      navigate('/verify-otp');
      enqueueSnackbar('OTP sent successfully', { variant: 'success', preventDuplicate: true });
    } catch (error) {
      if (isNetworkError(error)) {
        enqueueSnackbar('Unable to connect to the server. Please check your internet connection.', {
          variant: 'error',
          preventDuplicate: true,
        });
      } else {
        handleApiError(error, 'Failed to send OTP');
      }
      throw error;
    }
  };

  const verifyOTP = async (otp: string, phoneNumber: string) => {
    try {
      const {data}: any = await authService.verifyOTP(otp, phoneNumber);
      console.log(data);
      localStorage.removeItem('phoneNumber');
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token); // Save the token
      setUser(data.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      navigate('/dashboard');
      enqueueSnackbar('Login successful', { variant: 'success', preventDuplicate: true });
    } catch (error) {
      handleApiError(error, 'Invalid OTP');
      throw error;
    }
  };

  const logout = () => {
    try {
      // Perform logout API call
      authService.logout();
    } catch (error) {
      handleApiError(error, 'Logout failed');
    } finally {
      // Clear user data and token
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      navigate('/login');
      enqueueSnackbar('Logged out successfully', { variant: 'success', preventDuplicate: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
