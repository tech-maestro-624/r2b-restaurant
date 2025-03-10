import { useState } from 'react';
import { TextField, Button, Paper, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import Restaurant from '../../assets/Restaurant.png';
import BackgroundImage from "../../assets/top-view-frame-with-food-copy-space_23-2148247893.avif"
import RestaurantBlue from '../../assets/Midnight Blue@4x.png';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Centered login form */}
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
          <Box sx={{ textAlign: 'center', mb: 0.5 }}> {/* Further reduced margin-bottom */}
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
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="dense" // Reduced margin
              required
              type="tel"
              sx={{
                backgroundColor: 'white',
                '& .MuiInputBase-input': {
                  color: 'black',
                },
                '& .MuiInputLabel-root': {
                  color: 'black',
                },
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
              }}
              inputProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: 'black' },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}