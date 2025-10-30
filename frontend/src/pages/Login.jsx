import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../services/authService';
import { useAuth } from '../components/AuthContext.jsx';
import { Container, TextField, Typography, Button, Stack, Alert, Box } from '@mui/material';

const Login = () => {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [form, setForm] = useState({ email: '', password: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const data = await loginApi(form);
			login(data.user, data.token);
			navigate('/dashboard');
		} catch (err) {
			setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="xs" sx={{ py: 6 }}>
			<Typography variant="h5" gutterBottom>Log In</Typography>
			<Box component="form" onSubmit={handleSubmit}>
				<Stack spacing={2}>
					<TextField label="Email" type="email" name="email" value={form.email} onChange={handleChange} required fullWidth />
					<TextField label="Password" type="password" name="password" value={form.password} onChange={handleChange} required fullWidth />
					{error && <Alert severity="error">{error}</Alert>}
					<Button type="submit" variant="contained" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</Button>
				</Stack>
			</Box>
			<Typography sx={{ mt: 2 }}>
				Don't have an account? <Button component={Link} to="/signup">Sign up</Button>
			</Typography>
		</Container>
	);
};

export default Login;
