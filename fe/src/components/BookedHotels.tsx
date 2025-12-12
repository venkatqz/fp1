import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid, CircularProgress, Button, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CancelIcon from '@mui/icons-material/Cancel';

const BookedHotels: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Menu State ---
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    // --- Dialog State ---
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:3000/bookings/my-bookings');
            const data = await response.json();
            setBookings(data);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, booking: any) => {
        setAnchorEl(event.currentTarget);
        setSelectedBooking(booking);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedBooking(null);
    };

    const handleCancelClick = () => {
        // Close menu, open confirm dialog
        setAnchorEl(null);
        setConfirmOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedBooking) return;

        try {
            const response = await fetch(`http://localhost:3000/bookings/${selectedBooking.id}/cancel`, {
                method: 'PUT',
            });

            if (response.ok) {
                // Update local state to reflect cancellation
                setBookings(prev => prev.map(b =>
                    b.id === selectedBooking.id ? { ...b, status: 'CANCELED' } : b
                ));
            } else {
                alert('Failed to cancel booking');
            }
        } catch (err) {
            console.error('Cancel failed', err);
            alert('Error canceling booking');
        } finally {
            setConfirmOpen(false);
            setSelectedBooking(null);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;

    if (bookings.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary">No upcoming trips.</Typography>
                <Typography variant="body2">Time to book your next adventure!</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Your Bookings
            </Typography>
            <Grid container spacing={3}>
                {bookings.map((booking) => (
                    <Grid item xs={12} md={6} lg={4} key={booking.id}>
                        <Card sx={{
                            borderRadius: 3,
                            borderLeft: `6px solid ${booking.status === 'CANCELED' ? '#d32f2f' : '#FF8700'}`,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                            opacity: booking.status === 'CANCELED' ? 0.7 : 1
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {booking.hotelName || 'Hotel Booking'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {booking.roomName || 'Room'}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Chip
                                            icon={booking.status === 'CANCELED' ? <CancelIcon /> : <CheckCircleIcon />}
                                            label={booking.status}
                                            size="small"
                                            color={booking.status === 'CANCELED' ? 'error' : 'success'}
                                            variant="outlined"
                                            sx={{ mr: 1 }}
                                        />
                                        {booking.status !== 'CANCELED' && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, booking)}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                                    <EventIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {booking.checkIn} — {booking.checkOut}
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {booking.status === 'CANCELED' ? 'Refund Status' : 'Total Paid'}
                                    </Typography>
                                    <Typography variant="h6" color={booking.status === 'CANCELED' ? 'text.disabled' : 'primary.main'} fontWeight="bold">
                                        {booking.status === 'CANCELED' ? 'Refunded' : `₹${booking.totalPrice?.toLocaleString()}`}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleCancelClick} sx={{ color: 'error.main' }}>
                    Cancel Booking
                </MenuItem>
            </Menu>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
            >
                <DialogTitle>Cancel Booking?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel your stay at {selectedBooking?.hotelName}?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>No, Keep it</Button>
                    <Button onClick={handleConfirmCancel} color="error" variant="contained" autoFocus>
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookedHotels;
