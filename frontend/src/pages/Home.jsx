import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Stack, Button, Box, Card, CardContent, Grid } from '@mui/material';

const Home = () => {
	return (
		<Container maxWidth="md" sx={{ py: 8 }}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					mb: 6,
				}}
			>
				<Typography
					variant="h2"
					component="h1"
					gutterBottom
					sx={{ fontWeight: 700, letterSpacing: 2, color: 'primary.light', textAlign: 'center' }}
				>
					Habit Tracker
				</Typography>
				<Typography
					variant="h5"
					color="text.secondary"
					sx={{ mb: 3, textAlign: 'center', maxWidth: 600 }}
				>
					Build better habits, stay consistent, and reach your goals with a beautiful, simple tracker.
				</Typography>
				<Stack direction="row" spacing={3} sx={{ mt: 2 }}>
					<Button component={Link} to="/signup" variant="contained" size="large" color="primary" sx={{ fontWeight: 600 }}>
						Get Started
					</Button>
					<Button component={Link} to="/login" variant="outlined" size="large" color="secondary" sx={{ fontWeight: 600 }}>
						Log In
					</Button>
				</Stack>
			</Box>

			<Grid container spacing={4} justifyContent="center">
				<Grid item xs={12} sm={6} md={4}>
					<Card sx={{ bgcolor: '#181818', color: 'white', borderRadius: 3, boxShadow: 3 }}>
						<CardContent>
							<Typography variant="h6" gutterBottom>Track Progress</Typography>
							<Typography variant="body2" color="text.secondary">
								Visualize your daily, weekly, or custom habits and see your progress at a glance.
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={4}>
					<Card sx={{ bgcolor: '#181818', color: 'white', borderRadius: 3, boxShadow: 3 }}>
						<CardContent>
							<Typography variant="h6" gutterBottom>Stay Motivated</Typography>
							<Typography variant="body2" color="text.secondary">
								Get reminders and see streaks to keep you motivated and accountable.
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={4}>
					<Card sx={{ bgcolor: '#181818', color: 'white', borderRadius: 3, boxShadow: 3 }}>
						<CardContent>
							<Typography variant="h6" gutterBottom>Easy to Use</Typography>
							<Typography variant="body2" color="text.secondary">
								Simple, clean interface with quick signup and login. Start tracking in seconds.
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Container>
	);
};

export default Home;
