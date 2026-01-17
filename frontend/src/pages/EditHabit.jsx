import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { getHabits, updateHabit, updateHabitReminder, testHabitReminder } from '../services/habitService';
import { Container, Typography, TextField, Select, MenuItem, Button, Stack, Alert, Box, LinearProgress, Grid } from '@mui/material';
import HabitTickBoxes from '../components/HabitTickBoxes.jsx';
import ReminderSettings from '../components/ReminderSettings.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import { generateTickBoxes } from '../utils/tickBoxUtils';

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
			const updated = await updateHabit(id, { habitName: habit.habitName, frequency: habit.frequency }, token);
			setHabit(updated);
			setError('');
		} catch (err) {
			setError('Failed to update habit');
		}
	};

	const handleReminderUpdate = async (updatedHabit) => {
		try {
			const reminderData = {
				reminderEnabled: updatedHabit.reminderEnabled,
				reminderTime: updatedHabit.reminderTime,
				reminderDays: updatedHabit.reminderDays,
				reminderMessage: updatedHabit.reminderMessage
			};
			
			const updated = await updateHabitReminder(id, reminderData, token);
			setHabit(updatedHabit);
			setError('');
			return updated;
		} catch (err) {
			setError('Failed to update reminder settings');
			throw err;
		}
	};

	const handleTestReminder = async (habitId, customMessage) => {
		return await testHabitReminder(habitId, token, customMessage);
	};

	const calculateCompletionPercentage = () => {
		if (!habit) return 0;
		
		// Generate tick boxes based on frequency to get the expected count
		const tickBoxes = generateTickBoxes(habit.frequency, habit.completions || []);
		
		if (tickBoxes.length === 0) return 0;
		
		// Count completed boxes from the generated tick boxes
		const completed = tickBoxes.filter((box) => box.isCompleted).length;
		return Math.round((completed / tickBoxes.length) * 100);
	};

	if (!habit) return <Container sx={{ py: 3 }}>Loading...</Container>;

	const completionPercentage = calculateCompletionPercentage();

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
				<Typography variant="h5">Edit Habit</Typography>
				<StreakBadge 
					currentStreak={habit.currentStreak || 0}
					longestStreak={habit.longestStreak || 0}
					isStreakActive={(habit.currentStreak || 0) > 0}
					size="medium"
				/>
			</Box>

			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Box component="form" onSubmit={save} sx={{ mb: 3 }}>
						<Stack spacing={2}>
							<TextField name="habitName" label="Name" value={habit.habitName} onChange={handleChange} required fullWidth />
							<Select name="frequency" value={habit.frequency} onChange={handleChange} fullWidth>
								<MenuItem value="daily">Daily</MenuItem>
								<MenuItem value="weekly">Weekly</MenuItem>
								<MenuItem value="monthly">Monthly</MenuItem>
								<MenuItem value="custom">Custom</MenuItem>
							</Select>
							
							<Box sx={{ mt: 3 }}>
								<Typography variant="h6" gutterBottom>Completion Progress</Typography>
								<LinearProgress variant="determinate" value={completionPercentage} sx={{ mb: 1 }} />
								<Typography variant="caption" color="text.secondary">{completionPercentage}% completed</Typography>
							</Box>

							{error && <Alert severity="error">{error}</Alert>}
							<Button type="submit" variant="contained">Save Changes</Button>
						</Stack>
					</Box>

					<Box sx={{ mt: 3 }}>
						<Typography variant="subtitle2" gutterBottom>Completion History</Typography>
						<HabitTickBoxes habit={habit} onUpdate={setHabit} />
					</Box>
				</Grid>

				<Grid item xs={12} md={6}>
					<ReminderSettings 
						habit={habit}
						onUpdate={handleReminderUpdate}
						onTestReminder={handleTestReminder}
					/>
				</Grid>
			</Grid>
		</Container>
	);
};

export default EditHabit;
