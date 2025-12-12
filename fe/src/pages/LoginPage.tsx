import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Link as MuiLink } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if we were redirected from another page
    const from = location.state?.from || null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Simple storage for demo
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            window.dispatchEvent(new Event("storage")); // Notify other components

            alert(`Welcome back, ${data.user.name}!`);

            // Redirect Logic
            if (from) {
                navigate(from);
            } else {
                // Default Redirect
                if (data.user.role === 'HOTEL_MANAGER') {
                    navigate('/admin/hotel/new');
                } else {
                    navigate('/search');
                }
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '80vh', display: 'flex', alignItems: 'center' }}>
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 3,
                    width: '100%',
                    background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)'
                }}
            >
                <Box sx={{
                    m: 1,
                    bgcolor: 'secondary.main',
                    color: 'white',
                    p: 1.5,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 2
                }}>
                    <LockOutlinedIcon />
                </Box>

                <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    Sign in
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    to continue your booking
                </Typography>

                {from && (
                    <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
                        Please login to continue your reservation.
                    </Alert>
                )}

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        {loading ? 'Logging In...' : 'Sign In'}
                    </Button>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <MuiLink component={Link} to="/register" variant="body2" color="primary" fontWeight="medium">
                            {"Don't have an account? Sign Up"}
                        </MuiLink>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;
