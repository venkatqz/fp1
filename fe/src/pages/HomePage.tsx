import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import BookedHotels from '../components/BookedHotels';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                localStorage.removeItem('user'); // Clean up corrupt data
            }
        }
    }, []);

    return (
        <Box
            sx={{
                bgcolor: 'background.default',
                pt: 8,
                pb: 6,
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography component="h1" variant="h2" color="text.primary" gutterBottom fontWeight="bold">
                        Find your next stay
                    </Typography>
                    <Typography variant="h5" color="text.secondary" paragraph>
                        Search low prices on hotels, homes and much more...
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/search')}
                        sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 50 }}
                    >
                        Start Your Search
                    </Button>
                </Box>

                {/* Show Bookings if User is Logged In */}
                {user && (
                    <Box sx={{ mt: 8, p: 4, bgcolor: 'white', borderRadius: 4, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
                        <BookedHotels />
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default HomePage;
