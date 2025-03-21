import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { authService } from '../services/auth.service';
import { User, AuthContextType } from '../types/auth';
import { handleApiError, isNetworkError, isAuthError } from '../utils/error-handler';

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'restaurant_admin_user';
const TOKEN_STORAGE_KEY = 'authToken';

// Helper function to clear all branch selections from local storage.
const clearBranchStorage = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('selected_branch_')) {
      localStorage.removeItem(key);
    }
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Always initialize user as null instead of reading from localStorage.
  const [user, setUser] = useState<User | null>(null);
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
        // Verify token validity and get fresh user info.
        const { data } = await authService.checkAuth();
        console.log('Auth check successful:', data);
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

        // Redirect if authenticated but on login/verify-otp page.
        if (['/login', '/verify-otp'].includes(location.pathname)) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isAuthError(error)) {
          logout(); // Handle invalid tokens.
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location.pathname]);

  const login = async (phoneNumber: string) => {
    // Clear any stale data before starting a new login flow.
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    clearBranchStorage();

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
      const { data }: any = await authService.verifyOTP(otp, phoneNumber);
      console.log(data);
      // Clear any previous user/token data and branch info before saving new ones.
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      clearBranchStorage();

      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
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
      // Optionally, perform logout API call.
      authService.logout();
    } catch (error) {
      handleApiError(error, 'Logout failed');
    } finally {
      // Clear stored user data, token, and any branch info.
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      clearBranchStorage();

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
