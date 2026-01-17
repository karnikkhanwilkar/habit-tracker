import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { createHabit, getHabits, deleteHabit, updateHabit, getDashboardSummary } from '../services/habitService';
import HabitTickBoxes from '../components/HabitTickBoxes.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import { Container, Typography, TextField, Select, MenuItem, Button, Grid, Card, CardContent, CardActions, Stack, Alert, Box, Chip, IconButton, Tooltip, Badge } from '@mui/material';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { TopPerformers } from '../components/AnalyticsCharts.jsx';
import { useOfflineHabits } from '../hooks/useOfflineSupport.js';

const Dashboard = () => {
	const { token, logout, user } = useAuth();
	const [habits, setHabits] = useState([]);//use state is used to store the data in the database
	const [form, setForm] = useState({ habitName: '', frequency: 'daily' });
	const [error, setError] = useState('');
	const [confirm, setConfirm] = useState({ open: false, id: null });
	const [dashboardSummary, setDashboardSummary] = useState(null);
	const { isOnline, getCachedHabits, cacheHabits } = useOfflineHabits();

	const load = async () => {
		try {
			if (!isOnline) {
				// Load from cache when offline
				const cached = getCachedHabits();
				if (cached.length > 0) {
					setHabits(cached);
				}
				return;
			}

			const data = await getHabits(token);
			// Ensure data is always an array
			setHabits(Array.isArray(data) ? data : []);
			cacheHabits(Array.isArray(data) ? data : []); // Cache for offline use
			
			// Load dashboard summary
			const summary = await getDashboardSummary(token);
			setDashboardSummary(summary);
		} catch (err) {
			setError('Failed to load habits');
			
			// Fallback to cached data if API fails
			const cached = getCachedHabits();
			if (cached.length > 0) {
				setHabits(cached);
				setError('Using offline data - some features may be limited');
			} else {
				// Ensure habits is always an array even in error case
				setHabits([]);
			}
		}
	};

	useEffect(() => {
		load();
	}, []);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const addHabit = async (e) => {
		e.preventDefault();
		setError('');
		try {
			const created = await createHabit(form, token);
			setHabits([created, ...habits]);
			setForm({ habitName: '', frequency: 'daily' });
		} catch (err) {
			setError(err.response?.data?.errors?.[0]?.msg || 'Failed to create habit');
		}
	};

	const removeHabit = async (id) => {
		try {
			await deleteHabit(id, token);
			setHabits((habits || []).filter((h) => h._id !== id));
		} catch (_) {}
	};

	const handleHabitUpdate = (updatedHabit) => {
		setHabits((habits || []).map((h) => (h._id === updatedHabit._id ? updatedHabit : h)));
	};

	return (
		<Container sx={{ py: 3 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex" alignItems="center" gap={2}>
					<Typography variant="h5">Let's build a habit together!</Typography>
					{!isOnline && (
						<Chip 
							icon={<CloudOffIcon />} 
							label="Offline Mode" 
							color="warning" 
							variant="outlined"
							size="small"
						/>
					)}
				</Box>
				<Stack direction="row" spacing={2} alignItems="center">
					<Tooltip title="View Analytics">
						<IconButton 
							component={Link} 
							to="/analytics" 
							color="primary"
							sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
						>
							<AnalyticsIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			{/* Offline Alert */}
			{!isOnline && (
				<Alert severity="info" sx={{ mt: 2 }}>
					📱 You're currently offline. You can still view and check off your habits! 
					Changes will sync when you're back online.
				</Alert>
			)}

			{/* Dashboard Summary Cards */}
			{dashboardSummary && (
				<Grid container spacing={2} sx={{ mt: 2 }}>
					<Grid item xs={6} sm={3}>
						<Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
							<CardContent>
								<Typography variant="h4" fontWeight="bold">{dashboardSummary.totalHabits}</Typography>
								<Typography variant="body2">Total Habits</Typography>
							</CardContent>
						</Card>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
							<CardContent>
								<Typography variant="h4" fontWeight="bold">{dashboardSummary.activeStreaks}</Typography>
								<Typography variant="body2">Active Streaks 🔥</Typography>
							</CardContent>
						</Card>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
							<CardContent>
								<Typography variant="h4" fontWeight="bold">{dashboardSummary.completionToday}%</Typography>
								<Typography variant="body2">Today's Progress</Typography>
							</CardContent>
						</Card>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
							<CardContent>
								<Typography variant="h4" fontWeight="bold">{dashboardSummary.averageCompletion}%</Typography>
								<Typography variant="body2">Average Success</Typography>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			)}

			<Stack sx={{ mt: 3 }} spacing={2} component="form" onSubmit={addHabit} direction={{ xs: 'column', sm: 'row' }}>
				<TextField name="habitName" label="Habit name" value={form.habitName} onChange={handleChange} required fullWidth />
				<Select name="frequency" value={form.frequency} onChange={handleChange} sx={{ minWidth: 160 }}>
					<MenuItem value="daily">Daily</MenuItem>
					<MenuItem value="weekly">Weekly</MenuItem>
					<MenuItem value="monthly">Monthly</MenuItem>
					<MenuItem value="custom">Custom</MenuItem>
				</Select>
				<Button type="submit" variant="contained">Add</Button>
			</Stack>
			{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

			<Grid container spacing={3} sx={{ mt: 2 }}>
				<Grid item xs={12} md={8}>
					<Typography variant="h6" sx={{ mb: 2 }}>Your Habits</Typography>
					<Grid container spacing={2}>
						{(habits || []).map((h) => (
							<Grid item xs={12} key={h._id}>
								<Card>
									<CardContent>
										<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
											<Typography variant="subtitle1">{h.habitName}</Typography>
											<StreakBadge 
												currentStreak={h.currentStreak || 0}
												isStreakActive={h.currentStreak > 0} 
												size="small"
											/>
										</Box>
										<Typography variant="body2" color="text.secondary">Frequency: {h.frequency}</Typography>
											<HabitTickBoxes habit={h} onUpdate={handleHabitUpdate} rangeFromCreated futureDays={7} />
									</CardContent>
									<CardActions>
										<Button component={Link} to={`/habits/${h._id}`}>Edit</Button>
										<Button component={Link} to={`/analytics/${h._id}`} size="small" startIcon={<AnalyticsIcon />}>
											Stats
										</Button>
										<Button color="error" onClick={() => setConfirm({ open: true, id: h._id })}>Delete</Button>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>
				</Grid>

				<Grid item xs={12} md={4}>
					{dashboardSummary?.topPerformers?.length > 0 && (
						<TopPerformers 
							performers={dashboardSummary.topPerformers} 
							title="🏆 Top Performers"
						/>
					)}
				</Grid>
			</Grid>
			<ConfirmDialog
				open={confirm.open}
				title="Delete Habit"
				message="Are you sure you want to delete this habit? This cannot be undone."
				onCancel={() => setConfirm({ open: false, id: null })}
				onConfirm={() => { removeHabit(confirm.id); setConfirm({ open: false, id: null }); }}
			/>
		</Container>
	);
};

export default Dashboard;
