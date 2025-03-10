import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, Button, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/auth';

const Profile: React.FC = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

  if (!user) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const handleSave = () => {
    // Implement save functionality here
    console.log('Saved:', { name, email, phoneNumber });
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
          src={user.avatarUrl || ''}
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
        />
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          InputLabelProps={{ style: { color: 'white' } }} // Set the label color to white
          InputProps={{ style: { color: 'white' } }} // Set the input text color to white
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