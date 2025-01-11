// OTPVerification.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();

  // Get stored phone number
  const phoneNumber = localStorage.getItem('phoneNumber');

  useEffect(() => {
    // If there's no phone number in localStorage, redirect to login
    if (!phoneNumber) {
      navigate('/login');
      return;
    }
    
    // Check if OTP was saved from the login response
    const autoFillOTP = localStorage.getItem('autoFillOTP');
    if (autoFillOTP) {
      setOtp(autoFillOTP);
      // Optionally remove it after setting, so it’s not reused on refresh
      localStorage.removeItem('autoFillOTP');
    }
  }, [phoneNumber, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !phoneNumber) {
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(otp, phoneNumber);
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          mx: 2,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom textAlign="center">
          Verify OTP
        </Typography>
        <Typography color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Please enter the 6-digit code sent to {phoneNumber}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="OTP Code"
            variant="outlined"
            value={otp}
            onChange={handleOTPChange}
            margin="normal"
            required
            inputProps={{
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {otp.length}/6
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading || otp.length !== 6}
            sx={{ mt: 2 }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}