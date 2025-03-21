
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

import RestaurantBlue from '../../assets/Midnight Blue@4x.png';
import BackgroundImage from "../../assets/top-view-frame-with-food-copy-space_23-2148247893.avif";

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();

  const phoneNumber = localStorage.getItem('phoneNumber');

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/login');
      return;
    }
    const autoFillOTP = localStorage.getItem('autoFillOTP');
    if (autoFillOTP) {
      setOtp(autoFillOTP);
      localStorage.removeItem('autoFillOTP');
    }
  }, [phoneNumber, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOTP(otp, phoneNumber);
    } catch (error) {
      console.error('OTP verification failed:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px)',
        transform: 'scale(1.1)',
      }} />
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 20, 27, 0.3)',
      }} />
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '450px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Paper elevation={6} sx={{
          p: 5,
          width: '100%',
          backgroundColor: '#ebecde',
          color: 'black',
          border: '1px solid black',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Box sx={{ textAlign: 'center', mb: 0.5 }}>
            <img src={RestaurantBlue} alt="Restaurant Logo" style={{
              maxWidth: '300px',
              height: 'auto',
              filter: 'brightness(1.5)',
              borderRadius: '8px',
            }} />
          </Box>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Typography component="label" htmlFor="otp-input" sx={{ display: 'block', mb: 1, color: 'black', fontWeight: 500 }}>
              OTP Code:
            </Typography>
            <TextField
              fullWidth
              id="otp-input"
              variant="outlined"
              value={otp}
              onChange={handleOTPChange}
              margin="dense"
              required
              error={!!error}
              helperText={error || 'Enter the 6-digit OTP sent to your phone'}
              sx={{
                backgroundColor: '#ebecde',
                mt: 0,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'black' },
                  '&:hover fieldset': { borderColor: 'black' },
                  '&.Mui-focused fieldset': { borderColor: 'black' },
                },
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiFormHelperText-root': {
                  color: error ? 'red' : 'black',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  backgroundColor: '#ebecde',
                  padding: '2px 4px',
                  borderRadius: '4px',
                },
              }}
              inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{otp.length}/6</InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 3 }}>
              {loading ? 'Verifying...' : 'VERIFY OTP'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}