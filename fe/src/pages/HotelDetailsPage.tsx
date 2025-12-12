
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Typography, Box, Grid, Card, CardMedia, Button, Chip, Divider,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Stepper, Step, StepLabel, Paper
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WifiIcon from '@mui/icons-material/Wifi';
import PoolIcon from '@mui/icons-material/Pool';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SpaIcon from '@mui/icons-material/Spa';
import { HotelsService, BookingsService } from '../client';

// Helper to map string amenities to icons
const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <WifiIcon />;
    if (lower.includes('pool')) return <PoolIcon />;
    if (lower.includes('gym') || lower.includes('fitness')) return <FitnessCenterIcon />;
    if (lower.includes('restaurant') || lower.includes('dining')) return <RestaurantIcon />;
    if (lower.includes('bar')) return <LocalBarIcon />;
    if (lower.includes('spa')) return <SpaIcon />;
    return <StarIcon />;
};

const HotelDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking State
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [openBooking, setOpenBooking] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Step 1 Data
    const [guests, setGuests] = useState(2);

    // Step 2 Data (from Intent)
    const [intentData, setIntentData] = useState<any>(null);

    // Mock Dates
    const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
    const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // getHotels1 corresponds to getHotelById in backend (OpenAPI naming quirk)
                const data = await HotelsService.getHotels1(id);
                setHotel(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load hotel details.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleSelectRoom = (room: any) => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login, saving the current location to return to
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        setSelectedRoom(room);
        setActiveStep(0);
        setOpenBooking(true);
    };

    const handleCloseBooking = () => {
        setOpenBooking(false);
        setSelectedRoom(null);
        setIntentData(null);
    };

    const handleCreateIntent = async () => {
        if (!hotel || !selectedRoom) return;
        console.log('Starting Booking Intent...');
        try {
            setBookingLoading(true);
            const response = await BookingsService.postBookingsIntent({
                hotelId: hotel.id,
                roomTypeId: selectedRoom.id,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests,
            });
            console.log('Booking Intent Response:', response);
            setIntentData(response);
            setActiveStep(1);
        } catch (err) {
            console.error('Booking Intent Failed:', err);
            // Fallback for demo if API fails
            setIntentData({
                paymentIntentId: 'mock_fallback',
                clientSecret: 'secret',
                totalPrice: 15000,
                currency: 'INR'
            });
            setActiveStep(1);
            alert('API Failed - Using Mock Data');
        } finally {
            console.log('Booking Intent Finished');
            setBookingLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!intentData) return;
        try {
            setBookingLoading(true);
            await BookingsService.postBookingsConfirm({
                paymentIntentId: intentData.paymentIntentId,
                guestDetails: {
                    name: 'Guest User', // Mock
                    email: 'guest@example.com'
                }
            });
            setActiveStep(2); // Success
        } catch (err) {
            console.error('Booking Confirm Failed:', err);
            // Fallback
            setActiveStep(2);
            alert('API Failed (Confirm) - Using Mock Success');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
        </Box>
    );

    if (error || !hotel) return (
        <Container sx={{ mt: 5 }}>
            <Alert severity="error">{error || 'Hotel not found'}</Alert>
        </Container>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                        {hotel.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                        <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body1">{hotel.address}, {hotel.city}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        <Chip
                            icon={<StarIcon sx={{ "&&": { color: "#fff" } }} />}
                            label={`${hotel.rating} / 5`}
                            sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }}
                        />
                        {(hotel.rating ?? 0) >= 4.5 && (
                            <Chip label="Top Rated" color="primary" variant="outlined" />
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Card sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.50' }}>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                            ₹{hotel.lowestPrice}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>per night starts from</Typography>

                        <Divider sx={{ my: 2 }} />

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            color="secondary"
                            onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
                            sx={{ color: 'white', fontWeight: 'bold' }}
                        >
                            Select Room
                        </Button>
                    </Card>
                </Grid>
            </Grid>

            {/* Images - Simple Hero for now */}
            <Card sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
                <CardMedia
                    component="img"
                    height="400"
                    image={hotel.images?.[0] || 'https://via.placeholder.com/800x400?text=No+Image'}
                    alt={hotel.name}
                    sx={{ objectFit: 'cover' }}
                />
            </Card>

            {/* Centralized Booking Bar */}
            <Paper elevation={3} sx={{ p: 3, mb: 5, borderRadius: 3, mx: 'auto', maxWidth: '900px', transform: 'translateY(-40px)' }}>
                <Grid container spacing={3} alignItems="center" justifyContent="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Check-in"
                            type="date"
                            fullWidth
                            size="small"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Check-out"
                            type="date"
                            fullWidth
                            size="small"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: checkInDate || new Date().toISOString().split('T')[0] }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Guests"
                            type="number"
                            fullWidth
                            size="small"
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={4}>
                {/* Left Column: Info */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>About this stay</Typography>
                        <Typography variant="body1" paragraph lineHeight={1.8} color="text.secondary">
                            {hotel.description}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>Amenities</Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {hotel.amenities?.map((amenity: string) => (
                                <Grid item key={amenity} xs={6} sm={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                        {getAmenityIcon(amenity)}
                                        <Typography variant="body2">{amenity}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Rooms Section */}
            <Box id="rooms-section" sx={{ scrollMarginTop: '100px' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    Available Rooms
                </Typography>

                <Grid container spacing={3}>
                    {hotel.rooms?.map((room: any) => (
                        <Grid item xs={12} key={room.id}>
                            <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 2, borderRadius: 2, border: '1px solid #eee', boxShadow: 'none' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" fontWeight="bold">{room.name}</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Capacity: {room.capacity?.adults} Adults, {room.capacity?.children} Children
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {room.available} rooms left
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {room.amenities?.map((am: string) => (
                                            <Chip key={am} label={am} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: { xs: 'flex-start', sm: 'flex-end' },
                                    minWidth: '200px',
                                    mt: { xs: 2, sm: 0 },
                                    borderLeft: { sm: '1px solid #eee' },
                                    pl: { sm: 3 }
                                }}>
                                    <Typography variant="h5" color="primary" fontWeight="bold">₹{room.price}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>+ taxes & fees</Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={room.available === 0}
                                        onClick={() => handleSelectRoom(room)}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                    >
                                        {room.available === 0 ? 'Sold Out' : 'Select Room'}
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                    {!hotel.rooms?.length && (
                        <Typography variant="body1" color="text.secondary">No rooms available.</Typography>
                    )}
                </Grid>
            </Box>

            {/* Booking Dialog */}
            <Dialog open={openBooking} onClose={handleCloseBooking} maxWidth="sm" fullWidth>
                <DialogTitle>Complete your Booking</DialogTitle>
                <DialogContent>
                    <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
                        <Step><StepLabel>Details</StepLabel></Step>
                        <Step><StepLabel>Payment</StepLabel></Step>
                        <Step><StepLabel>Confirmed</StepLabel></Step>
                    </Stepper>

                    {activeStep === 0 && selectedRoom && (
                        <Box>
                            <Typography variant="h6" gutterBottom>{selectedRoom.name}</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {hotel.name}
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Check-in"
                                        type="date"
                                        fullWidth
                                        value={checkInDate}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Check-out"
                                        type="date"
                                        fullWidth
                                        value={checkOutDate}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Guests"
                                        type="number"
                                        fullWidth
                                        value={guests}
                                        onChange={(e) => setGuests(Number(e.target.value))}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                                <Typography variant="subtitle2">Estimated Total</Typography>
                                <Typography variant="h5" color="primary" fontWeight="bold">
                                    ₹{
                                        (selectedRoom.price * guests * Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)))).toLocaleString()
                                    }
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)))} night(s) * {guests} guest(s)
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {activeStep === 1 && intentData && (
                        <Box>
                            <Typography variant="h6" gutterBottom color="success.main">Booking Ready to Pay</Typography>
                            <Typography variant="body1">
                                Confirmed Total Price: <b>{intentData.currency} {intentData.totalPrice}</b>
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                Payment Gateway Mock
                            </Typography>
                            <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1, textAlign: 'center' }}>
                                CREDIT CARD INPUT WOULD GO HERE
                            </Box>
                        </Box>
                    )}

                    {activeStep === 2 && (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="h5" color="success.main" fontWeight="bold" gutterBottom>
                                Booking Confirmed!
                            </Typography>
                            <Typography variant="body1">
                                Your stay at {hotel.name} is booked.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Check your email for details.
                            </Typography>
                        </Box>
                    )}

                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    {activeStep !== 2 && (
                        <Button onClick={handleCloseBooking} disabled={bookingLoading}>Cancel</Button>
                    )}

                    {activeStep === 0 && (
                        <Button
                            variant="contained"
                            onClick={handleCreateIntent}
                            disabled={bookingLoading}
                        >
                            {bookingLoading ? 'Processing...' : 'Review Price'}
                        </Button>
                    )}

                    {activeStep === 1 && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                        >
                            {bookingLoading ? 'Confirming...' : 'Pay & Confirm'}
                        </Button>
                    )}

                    {activeStep === 2 && (
                        <Button variant="contained" onClick={handleCloseBooking}>
                            Done
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default HotelDetailsPage;
