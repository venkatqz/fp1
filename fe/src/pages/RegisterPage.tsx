import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, MenuItem, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { AuthService, ApiError, UserRole } from '../client';
import { useUI } from '../context/UIContext';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { showLoader, hideLoader, showToast } = useUI();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: UserRole.CUSTOMER,
        phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            showToast({ type: 'warning', msg: 'Please fill in all required fields.' });
            return;
        }

        try {
            showLoader();
            const response = await AuthService.registerUser({
                ...formData,
                role: formData.role as UserRole
            });

            // Assuming the client throws on error, if we reach here it's arguably success.
            // But let's check data struct if needed. Assuming void or data return.
            // If the method returns CancelablePromise<...>, wait it.

            const data = response as any;
            if (data.status === false) { // Check if specific status field says false
                throw new Error(data.message || 'Registration failed');
            }

            // Success
            showToast({ type: 'success', msg: 'Registration Successful! Please Login.' });
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            if (err instanceof ApiError) {
                showToast({ type: 'error', msg: err.body?.message || err.message || 'Registration failed' });
            } else {
                showToast({ type: 'error', msg: err.message || 'Registration failed' });
            }
        } finally {
            hideLoader();
        }
    };

    return (
        <>
            {/* Brand Header */}
            <Box sx={{
                textAlign: 'center',
                pt: 4,
                pb: 2
            }}>
                <Typography
                    variant="h3"
                    component="a"
                    href="/"
                    sx={{
                        fontFamily: 'Inter',
                        fontWeight: 800,
                        letterSpacing: '-.05rem',
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                            opacity: 0.8
                        }
                    }}
                >
                    HotelRent
                </Typography>
            </Box>

            <Container component="main" maxWidth="xs" sx={{ height: '90vh', display: 'flex', alignItems: 'center' }}>
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
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 1.5,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 2
                    }}>
                        <PersonAddOutlinedIcon />
                    </Box>

                    <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                        Create Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Join us to book your perfect stay
                    </Typography>



                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            type="email"
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            type="password"
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        <TextField
                            select
                            fullWidth
                            label="I am a..."
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            margin="normal"
                            helperText="Select 'Hotel Manager' if you want to host."
                        >
                            <MenuItem value={UserRole.CUSTOMER}>Customer (I want to book)</MenuItem>
                            <MenuItem value={UserRole.HOTEL_MANAGER}>Hotel Manager (I want to host)</MenuItem>
                        </TextField>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="secondary"
                            size="large"
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            Sign Up
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <MuiLink component={Link} to="/login" variant="body2" color="primary" fontWeight="medium">
                                Already have an account? Sign In
                            </MuiLink>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </>
    );
};

export default RegisterPage;
