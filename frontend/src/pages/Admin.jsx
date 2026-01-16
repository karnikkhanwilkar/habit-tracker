import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, Chip, Stack, Tabs, Tab, Card, CardContent, 
  Grid, Alert, CircularProgress, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauth, setUnauth] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [systemHealth, setSystemHealth] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      // Handle nested response structure and ensure users is always an array
      const userData = res.data.data?.users || res.data;
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      alert('Failed to fetch users');
    }
    setLoading(false);
  };

  const fetchSystemHealth = async () => {
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    if (!adminAuth.token) return;
    
    setHealthLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/system/health`,
        { headers: { Authorization: `Bearer ${adminAuth.token}` } }
      );
      setSystemHealth(res.data.data || res.data);
    } catch (err) {
      alert('Failed to fetch system health');
    }
    setHealthLoading(false);
  };

  const fetchAppStats = async () => {
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    if (!adminAuth.token) return;
    
    setStatsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/stats`,
        { headers: { Authorization: `Bearer ${adminAuth.token}` } }
      );
      setAppStats(res.data.data || res.data);
    } catch (err) {
      alert('Failed to fetch application stats');
    }
    setStatsLoading(false);
  };

  const handleDelete = async (id) => {
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    if (!window.confirm('Delete this user and all their habits?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${adminAuth.token}` } }
      );
      setUsers((users || []).filter(u => u._id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && !systemHealth) {
      fetchSystemHealth();
    }
    if (newValue === 2 && !appStats) {
      fetchAppStats();
    }
  };

  // Filter users based on search term
  const filteredUsers = (users || []).filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  if (unauth) return <Box p={4}><Typography color="error">Unauthorized. Please log in as admin.</Typography></Box>;
  if (loading) return <Box p={4}><Typography>Loading...</Typography></Box>;

  return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Admin Panel</Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
      </Stack>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="User Management" />
        <Tab label="System Health" />
        <Tab label="Analytics" />
      </Tabs>

      {/* Tab 0: User Management */}
      {tabValue === 0 && (
        <Box>
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
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
                {filteredUsers.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.name}
                      {user.isAdmin && <Chip label="Admin" size="small" color="warning" sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {(user.habits || []).map(habit => (
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
          {filteredUsers.length === 0 && searchTerm && (
            <Box textAlign="center" mt={3}>
              <Typography color="text.secondary">
                No users found matching "{searchTerm}"
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Tab 1: System Health */}
      {tabValue === 1 && (
        <Box>
          {healthLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : systemHealth ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>System Status</Typography>
                    <Typography variant="body2">Status: <Chip label={systemHealth.system?.status || 'Unknown'} color="success" size="small" /></Typography>
                    <Typography variant="body2">Uptime: {Math.floor((systemHealth.system?.uptime || 0) / 3600)}h {Math.floor(((systemHealth.system?.uptime || 0) % 3600) / 60)}m</Typography>
                    <Typography variant="body2">Environment: {systemHealth.system?.environment || 'N/A'}</Typography>
                    <Typography variant="body2">Node Version: {systemHealth.system?.nodeVersion || 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Memory Usage</Typography>
                    <Typography variant="body2">Used: {systemHealth.system?.memory?.used || 'N/A'}</Typography>
                    <Typography variant="body2">Total: {systemHealth.system?.memory?.total || 'N/A'}</Typography>
                    <Typography variant="body2">Percentage: {systemHealth.system?.memory?.percentage || 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Database Status</Typography>
                    <Typography variant="body2">
                      {JSON.stringify(systemHealth.database || {}, null, 2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">Click to load system health data</Alert>
          )}
        </Box>
      )}

      {/* Tab 2: Application Analytics */}
      {tabValue === 2 && (
        <Box>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : appStats ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Overview</Typography>
                    <Typography variant="body2">Total Users: {appStats.overview?.totalUsers || 0}</Typography>
                    <Typography variant="body2">Total Habits: {appStats.overview?.totalHabits || 0}</Typography>
                    <Typography variant="body2">Active Habits: {appStats.overview?.activeHabits || 0}</Typography>
                    <Typography variant="body2">Habits with Reminders: {appStats.overview?.habitsWithReminders || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                    <Typography variant="body2">New Users (7 days): {appStats.recent?.newUsersThisWeek || 0}</Typography>
                    <Typography variant="body2">New Habits (7 days): {appStats.recent?.newHabitsThisWeek || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Engagement</Typography>
                    <Typography variant="body2">Avg Habits/User: {appStats.engagement?.avgHabitsPerUser || 0}</Typography>
                    <Typography variant="body2">Active Habits: {appStats.engagement?.activeHabitsPercentage || 0}%</Typography>
                    <Typography variant="body2">Reminder Adoption: {appStats.engagement?.reminderAdoptionRate || 0}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">Click to load application analytics</Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Admin;
