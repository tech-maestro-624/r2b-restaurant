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

import Restaurant from '../../assets/Restaurant.png';

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
        bgcolor: '#00141B',
        gap: '20vh',
      }}
    >
      <img src={Restaurant} alt="Example Image" />
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          mx: 2,
          border: '1px solid white',
          backgroundColor: '#00141B',
          color: 'white',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom textAlign="center">
          Verify OTP
        </Typography>
        <Typography color="text.secondary" textAlign="center" sx={{ mb: 3, color: 'white' }}>
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
            sx={{
              backgroundColor: 'white',
              '& .MuiInputLabel-root': {
                color: 'black', // Change label color
              },
              '& .MuiInputLabel-shrink': {
                color: 'black', // Change label color when it shrinks
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'black', // Change border color
                },
                '&:hover fieldset': {
                  borderColor: 'black', // Change border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'black', // Change border color when focused
                },
              },
            }}
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
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}