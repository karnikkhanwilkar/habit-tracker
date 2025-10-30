import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);

	useEffect(() => {
		const stored = localStorage.getItem('auth');
		if (stored) {
			const { user, token } = JSON.parse(stored);
			setUser(user);
			setToken(token);
		}
	}, []);

	const login = (user, token) => {
		setUser(user);
		setToken(token);
		localStorage.setItem('auth', JSON.stringify({ user, token }));
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('auth');
	};

	return (
		<AuthContext.Provider value={{ user, token, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
