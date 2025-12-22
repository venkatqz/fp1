import React from 'react';
import { Container, Box, Typography, Avatar, Divider, Chip } from '@mui/material';
import BookedHotels from '../components/BookedHotels';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!user) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                    sx={{ width: 80, height: 80, bgcolor: 'orange', fontSize: '2rem' }}
                >
                    {user.name.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>{user.name}</Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold" color="text.secondary">Name:</Typography>
                            <Typography variant="body1">{user.name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold" color="text.secondary">Email:</Typography>
                            <Typography variant="body1">{user.email}</Typography>
                        </Box>
                        {user.phone && user.phone !== 'string' && (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight="bold" color="text.secondary">Phone:</Typography>
                                <Typography variant="body1">{user.phone}</Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold" color="text.secondary">Role:</Typography>
                            <Chip label={user.role} size="small" variant="outlined" />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {user.role !== 'HOTEL_MANAGER' && (
                <>
                    <Divider sx={{ mb: 6 }} />
                    <BookedHotels />
                </>
            )}
        </Container>
    );
};

export default ProfilePage;


