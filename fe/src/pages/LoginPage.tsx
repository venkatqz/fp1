import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Link as MuiLink } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext';
import { AuthService, ApiError } from '../client';
import { useUI } from '../context/UIContext';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { showLoader, hideLoader, showToast } = useUI();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Check if we were redirected from another page
    const from = location.state?.from || null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            showLoader();
            const response = await AuthService.loginUser(formData);

            // Check response format (depending on how AuthService is generated, it might return data directly or a wrapper)
            // Assuming standard generated client which returns the success response body
            const data = response as any; // Cast if necessary to match flexible return

            // The generated service usually throws on non-2xx, so we might just get data directly
            // Adjust based on your API response structure. 
            // In previous fetch it was: data = await response.json(); user = data.data.user

            // Let's assume AuthService returns the full body
            if (!data.status || !data.data) {
                throw new Error('Login failed: Invalid response format');
            }

            login(data.data.token, data.data.user);

            showToast({ type: 'success', msg: `Welcome back, ${data.data.user.name}!` });

            // Redirect Logic
            if (from) {
                navigate(from);
            } else {
                if (data.data.user.role === 'HOTEL_MANAGER') {
                    navigate('/manager/dashboard');
                } else {
                    navigate('/search');
                }
            }

        } catch (err: any) {
            console.error(err);
            if (err instanceof ApiError) {
                showToast({ type: 'error', msg: err.body?.message || err.message || 'Login failed' });
            } else {
                showToast({ type: 'error', msg: err.message || 'Login failed' });
            }
        } finally {
            hideLoader();
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
                        sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        Sign In
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
