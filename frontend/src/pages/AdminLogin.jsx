import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

const ADMIN_EMAIL = 'karnik@yahoo.com'; // match seedAdmin.js

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );
      // Only allow if email matches admin
      if (res.data.user.email !== ADMIN_EMAIL) {
        setError('Invalid admin credentials');
        return;
      }
      localStorage.setItem('adminAuth', JSON.stringify(res.data));
      navigate('/admin/panel');
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <Box minHeight="80vh" display="flex" alignItems="center" justifyContent="center">
      <Paper sx={{ p: 4, width: 350 }} elevation={3}>
        <Typography variant="h5" mb={2}>Admin Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <Typography color="error" mt={1}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
