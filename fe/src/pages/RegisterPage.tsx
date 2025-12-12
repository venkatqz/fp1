import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, MenuItem, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CUSTOMER',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Success
            alert('Registration Successful! Please Login.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
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

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

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
                        <MenuItem value="CUSTOMER">Customer (I want to book)</MenuItem>
                        <MenuItem value="HOTEL_MANAGER">Hotel Manager (I want to host)</MenuItem>
                    </TextField>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <MuiLink component={Link} to="/login" variant="body2" color="primary" fontWeight="medium">
                            Already have an account? Sign In
                        </MuiLink>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;
