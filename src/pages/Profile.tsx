import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, Button, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import { branchService } from '../services/branch.service';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
console.log('user',user);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await branchService.getCurrentUser();
      console.log(userData)
      console.log('userData.name',userData.name);
      if (userData) {
        setName(userData.name);
        setPhoneNumber(userData.phoneNumber);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    let valid = true;

    if (!name) {
      setNameError('Name is required');
      valid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      setNameError('Name is invalid');
      valid = false;
    } else {
      setNameError('');
    }

    if (!phoneNumber) {
      setPhoneNumberError('Phone number is required');
      valid = false;
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneNumberError('Phone number is invalid');
      valid = false;
    } else {
      setPhoneNumberError('');
    }

    if (!valid) {
      return;
    }

    try {
      if (!user) {
        console.error('User is not authenticated');
        return;
      }
      const response = await api.put(`/user/${user._id}`, { name, phoneNumber });
      console.log('Saved:', response.data);
      navigate('/dashboard'); // Redirect to the dashboard after successful save
    } catch (error) {
      console.error('Error saving profile:', error);
      // Optionally, show an error message
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: '#0f1215', // Set the background color of the entire page
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          backgroundColor: '#0f1215', // Set the background color of the Paper component
          color: 'white', // Set the text color to white
          border: '1px solid white', // Set the border color to white
        }}
      >
        <Avatar
          alt={name || 'User Avatar'}
          src={user?.avatarUrl || ''}
          sx={{ width: 100, height: 100, margin: '0 auto 20px' }}
        />
        <Typography variant="h5" component="h1" gutterBottom>
          Edit Profile
        </Typography>
        <TextField
          fullWidth
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          InputLabelProps={{ style: { color: 'white' } }} // Set the label color to white
          InputProps={{ style: { color: 'white' } }} // Set the input text color to white
          error={!!nameError}
          helperText={nameError}
        />
        <TextField
          fullWidth
          label="Phone Number"
          variant="outlined"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          margin="normal"
          InputLabelProps={{ style: { color: 'white' } }} // Set the label color to white
          InputProps={{ style: { color: 'white' } }} // Set the input text color to white
          error={!!phoneNumberError}
          helperText={phoneNumberError}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Paper>
    </Box>
  );
};

export default Profile;