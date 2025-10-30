import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, Chip, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauth, setUnauth] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const fetchUsers = async () => {
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    if (!adminAuth.token) {
      setUnauth(true);
      return;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/users`,
        { headers: { Authorization: `Bearer ${adminAuth.token}` } }
      );
      setUsers(res.data);
    } catch (err) {
      alert('Failed to fetch users');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    if (!window.confirm('Delete this user and all their habits?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${adminAuth.token}` } }
      );
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  if (unauth) return <Box p={4}><Typography color="error">Unauthorized. Please log in as admin.</Typography></Box>;
  if (loading) return <Box p={4}><Typography>Loading...</Typography></Box>;

  return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Admin Panel: User Management</Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
      </Stack>
      <TableContainer component={Paper} sx={{ background: '#181818' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Habits</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user._id}>
                <TableCell>
                  {user.name}
                  {user.isAdmin && <Chip label="Admin" size="small" color="warning" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {user.habits.map(habit => (
                      <li key={habit._id}>
                        <strong>{habit.habitName}</strong> ({habit.frequency}) - Progress: {habit.progress}%
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  {!user.isAdmin && (
                    <Button variant="contained" color="error" size="small" onClick={() => handleDelete(user._id)}>
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Admin;
