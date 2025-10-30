import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { getHabits, updateHabit } from '../services/habitService';
import { Container, Typography, TextField, Select, MenuItem, Button, Stack, Alert, Box } from '@mui/material';

const EditHabit = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { token } = useAuth();
	const [habit, setHabit] = useState(null);
	const [error, setError] = useState('');

	useEffect(() => {
		const load = async () => {
			try {
				const habits = await getHabits(token);
				const found = habits.find((h) => h._id === id);
				if (!found) return navigate('/dashboard');
				setHabit(found);
			} catch (_) {
				setError('Failed to load habit');
			}
		};
		load();
	}, [id, token, navigate]);

	const handleChange = (e) => setHabit({ ...habit, [e.target.name]: e.target.value });

	const save = async (e) => {
		e.preventDefault();
		try {
			await updateHabit(id, { habitName: habit.habitName, frequency: habit.frequency, progress: Number(habit.progress) }, token);
			navigate('/dashboard');
		} catch (err) {
			setError('Failed to update habit');
		}
	};

	if (!habit) return <Container sx={{ py: 3 }}>Loading...</Container>;

	return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Typography variant="h5" gutterBottom>Edit Habit</Typography>
			<Box component="form" onSubmit={save}>
				<Stack spacing={2}>
					<TextField name="habitName" label="Name" value={habit.habitName} onChange={handleChange} required fullWidth />
					<Select name="frequency" value={habit.frequency} onChange={handleChange} fullWidth>
						<MenuItem value="daily">Daily</MenuItem>
						<MenuItem value="weekly">Weekly</MenuItem>
						<MenuItem value="monthly">Monthly</MenuItem>
						<MenuItem value="custom">Custom</MenuItem>
					</Select>
					<TextField type="number" name="progress" label="Progress (0-100)" inputProps={{ min: 0, max: 100 }} value={habit.progress} onChange={handleChange} fullWidth />
					{error && <Alert severity="error">{error}</Alert>}
					<Button type="submit" variant="contained">Save</Button>
				</Stack>
			</Box>
		</Container>
	);
};

export default EditHabit;
