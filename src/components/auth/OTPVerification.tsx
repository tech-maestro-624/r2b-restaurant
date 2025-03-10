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
      // Optionally remove it after setting, so it's not reused on refresh
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
        width: '100%',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Blurry background image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transform: 'scale(1.1)', /* Slightly scale up to avoid blur edges */
        }}
      />
      {/* Optional overlay to improve readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 20, 27, 0.3)', /* Semi-transparent overlay */
        }}
      />
      {/* Centered OTP verification form */}
      <Box
        sx={{
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
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 5,
            width: '100%',
            backgroundColor: '#ebecde', // Change background color to pale yellow
            color: 'black', // Change text color to black
            border: '1px solid black', // Change border color to black
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Restaurant logo inside the form container */}
          <Box sx={{ textAlign: 'center', mb: 0.5 }}> {/* Reduced margin-bottom */}
            <img 
              src={RestaurantBlue} 
              alt="Restaurant Logo" 
              style={{ 
                maxWidth: '300px',
                height: 'auto',
                filter: 'brightness(1.5)', // Lighter color effect
                borderRadius: '8px', // Add border radius
              }} 
            />
          </Box>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Typography
              component="label"
              htmlFor="otp-input"
              sx={{
                display: 'block',
                mb: 1,
                color: 'black',
                fontWeight: 500,
              }}
            >
              OTP Code:
            </Typography>
            <TextField
              fullWidth
              id="otp-input"
              variant="outlined"
              value={otp}
              onChange={handleOTPChange}
              margin="dense" // Reduced margin
              required
              sx={{
                backgroundColor: 'white',
                mt: 0,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'black', 
                  },
                  '&:hover fieldset': {
                    borderColor: 'black', 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'black', 
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'black', // This sets the text color inside the input
                },
                '& .MuiInputAdornment-root': {
                  color: 'black', // This sets the color of the character counter
                },
              }}
              inputProps={{
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: { color: 'black' }, // Direct style on the input element
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {otp.length}/6
                  </InputAdornment>
                ),
                style: { color: 'black' }, // Style for the InputProps container
              }}
              // Remove the default label from TextField
              label=""
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Verifying...' : 'VERIFY OTP'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}