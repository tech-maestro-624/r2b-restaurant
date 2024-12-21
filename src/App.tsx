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
import RestaurantList from './pages/Restaurants/RestaurantList';
import BranchList from './pages/Branches/BranchList';
import MenuList from './pages/Menu/MenuList';
import OrderList from './pages/Orders/OrderList';
import OrderDetailsPage from './components/order/orderDetails';
import CouponsList from './pages/Coupons/couponsList';
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
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
                      <Route path="/restaurants" element={<RestaurantList />} />
                      <Route path="/branches" element={<BranchList />} />
                      <Route path="/menu" element={<MenuList />} />
                      <Route path="/orders" element={<OrderList />} />
                      <Route path="/orders/:id" element={<OrderDetailsPage />} />
                      <Route path="/coupons" element={<CouponsList />} />
                    </Route>
                  </Route>
                </Routes>
              </BranchProvider>
            </AuthProvider>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;