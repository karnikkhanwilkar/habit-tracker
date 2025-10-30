import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { createHabit, getHabits, deleteHabit, updateHabit } from '../services/habitService';
import { Container, Typography, TextField, Select, MenuItem, Button, Grid, Card, CardContent, CardActions, LinearProgress, Stack, Alert, Chip } from '@mui/material';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const Dashboard = () => {
	const { token, logout, user } = useAuth();
	const [habits, setHabits] = useState([]);//use state is used to store the data in the database
	const [form, setForm] = useState({ habitName: '', frequency: 'daily', progress: 0 });
	const [error, setError] = useState('');
	const [confirm, setConfirm] = useState({ open: false, id: null });

	const load = async () => {
		try {
			const data = await getHabits(token);
			setHabits(data);
		} catch (err) {
			setError('Failed to load habits');
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
			setForm({ habitName: '', frequency: 'daily', progress: 0 });
		} catch (err) {
			setError(err.response?.data?.errors?.[0]?.msg || 'Failed to create habit');
		}
	};

	const removeHabit = async (id) => {
		try {
			await deleteHabit(id, token);
			setHabits(habits.filter((h) => h._id !== id));
		} catch (_) {}
	};

	const bumpProgress = async (h) => {
		const next = Math.min(100, (h.progress || 0) + 10);
		const updated = await updateHabit(h._id, { progress: next }, token);
		setHabits(habits.map((x) => (x._id === h._id ? updated : x)));
	};

	return (
		<Container sx={{ py: 3 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Typography variant="h5">Dashboard</Typography>
				<Stack direction="row" spacing={2} alignItems="center">
					<Typography>Hi, {user?.name}</Typography>
					<Button onClick={logout} variant="outlined">Logout</Button>
				</Stack>
			</Stack>

			<Stack sx={{ mt: 3 }} spacing={2} component="form" onSubmit={addHabit} direction={{ xs: 'column', sm: 'row' }}>
				<TextField name="habitName" label="Habit name" value={form.habitName} onChange={handleChange} required fullWidth />
				<Select name="frequency" value={form.frequency} onChange={handleChange} sx={{ minWidth: 160 }}>
					<MenuItem value="daily">Daily</MenuItem>
					<MenuItem value="weekly">Weekly</MenuItem>
					<MenuItem value="monthly">Monthly</MenuItem>
					<MenuItem value="custom">Custom</MenuItem>
				</Select>
				<TextField type="number" name="progress" label="Progress" value={form.progress} inputProps={{ min: 0, max: 100 }} onChange={handleChange} sx={{ width: 120 }} />
				<Button type="submit" variant="contained">Add</Button>
			</Stack>
			{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

			<Typography variant="h6" sx={{ mt: 4 }}>Your Habits</Typography>
			<Grid container spacing={2} sx={{ mt: 1 }}>
				{habits.map((h) => (
					<Grid item xs={12} sm={6} md={4} key={h._id}>
						<Card>
							<CardContent>
								<Typography variant="subtitle1">{h.habitName}</Typography>
								<Typography variant="body2" color="text.secondary">Frequency: {h.frequency}</Typography>
								<LinearProgress variant="determinate" value={h.progress || 0} sx={{ my: 1 }} />
								<Typography variant="caption">{h.progress || 0}%</Typography>
							</CardContent>
							<CardActions>
								<Button onClick={() => bumpProgress(h)}>+10%</Button>
								<Button component={Link} to={`/habits/${h._id}`}>Edit</Button>
								<Button color="error" onClick={() => setConfirm({ open: true, id: h._id })}>Delete</Button>
							</CardActions>
						</Card>
					</Grid>
				))}
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
