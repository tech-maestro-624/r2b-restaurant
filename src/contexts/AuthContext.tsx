import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { authService } from '../services/auth.service';
import { User, AuthContextType } from '../types/auth';
import { handleApiError, isNetworkError, isAuthError } from '../utils/error-handler';

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'restaurant_admin_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await authService.checkAuth();
        setUser(data.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        
        // If on login/verify-otp page and authenticated, redirect to dashboard
        if (['/login', '/verify-otp'].includes(location.pathname)) {
          navigate('/dashboard');
        }
      } catch (error) {
        // Only clear user if there's an actual auth error
        if (isAuthError(error)) {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only check auth if we have a stored user
    if (localStorage.getItem(STORAGE_KEY)) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [navigate, location.pathname]);

  const login = async (phoneNumber: string) => {
    try {
      await authService.login(phoneNumber);
      localStorage.setItem('phoneNumber', phoneNumber);
      navigate('/verify-otp');
      enqueueSnackbar('OTP sent successfully', { 
        variant: 'success',
        preventDuplicate: true,
      });
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
      const { data } = await authService.verifyOTP(otp, phoneNumber);
      localStorage.removeItem('phoneNumber');
      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      navigate('/dashboard');
      enqueueSnackbar('Login successful', { 
        variant: 'success',
        preventDuplicate: true,
      });
    } catch (error) {
      handleApiError(error, 'Invalid OTP');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      navigate('/login');
      enqueueSnackbar('Logged out successfully', { 
        variant: 'success',
        preventDuplicate: true,
      });
    } catch (error) {
      handleApiError(error, 'Logout failed');
      // Force logout on client side even if API call fails
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      navigate('/login');
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