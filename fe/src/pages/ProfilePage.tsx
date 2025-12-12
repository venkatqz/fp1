import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Avatar, Divider } from '@mui/material';
import BookedHotels from '../components/BookedHotels';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [navigate]);

    if (!user) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                    sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
                >
                    {user.name.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight="bold">{user.name}</Typography>
                    <Typography variant="body1" color="text.secondary">{user.email}</Typography>
                    {user.phone && (
                        <Typography variant="body2" color="text.secondary">{user.phone}</Typography>
                    )}
                    <Chip label={user.role} size="small" sx={{ mt: 1 }} />
                </Box>
            </Box>

            <Divider sx={{ mb: 6 }} />

            <BookedHotels />
        </Container>
    );
};

export default ProfilePage;

// Helper component for Chip
import { Chip } from '@mui/material';
