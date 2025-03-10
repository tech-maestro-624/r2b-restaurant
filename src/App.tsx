import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { BranchProvider } from './contexts/BranchContext';
import MainLayout from './components/layout/MainLayout';
import Login from './components/auth/Login';
import OTPVerification from './components/auth/OTPVerification';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import BranchList from './pages/Branches/BranchList';
import MenuList from './pages/Menu/MenuList';
import OrderList from './pages/Orders/OrderList';
import OrderDetailsPage from './components/order/orderDetails';
import CouponsList from './pages/Coupons/couponsList';
import Profile from './pages/Profile'; // Import the Profile component
import { Box } from '@mui/material'; // Import Box component

const theme = createTheme({
  palette: {
    background: {
      default: '#0F1215',
    },
    text: {
      primary: '#ffffff',
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontSize: 16, // Increase the base font size
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
            <BrowserRouter>
              <AuthProvider>
                <BranchProvider>
                  <Routes>
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />
                    <Route element={<ProtectedRoute />}>
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/branches" element={<BranchList />} />
                        <Route path="/menu" element={<MenuList />} />
                        <Route path="/orders" element={<OrderList />} />
                        <Route path="/orders/:id" element={<OrderDetailsPage />} />
                        <Route path="/coupons" element={<CouponsList />} />
                        <Route path='/profile' element={<Profile />} />
                      </Route>
                    </Route>
                  </Routes>
                </BranchProvider>
              </AuthProvider>
            </BrowserRouter>
          </Box>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;