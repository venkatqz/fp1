
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Typography, Box, Grid, Card, CardMedia, Button, Chip, Divider,
    CircularProgress, Alert, Paper
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WifiIcon from '@mui/icons-material/Wifi';
import PoolIcon from '@mui/icons-material/Pool';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SpaIcon from '@mui/icons-material/Spa';
import { CustomerService } from '../client';
import BookingDialog from '../components/BookingDialog';

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

    // Initialize state from location (Search Results) if available
    const [hotel, setHotel] = useState<any>(location.state?.hotel || null);
    const [loading, setLoading] = useState(!location.state?.hotel);
    const [error, setError] = useState('');

    // Booking State
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [openBooking, setOpenBooking] = useState(false);

    useEffect(() => {
        // If we already have hotel data from state, we might need to normalize it
        if (hotel) {
            let needsUpdate = false;
            let updatedHotel = { ...hotel };

            // 1. Map 'rooms_details' to 'rooms'
            if (!hotel.rooms && hotel.rooms_details) {
                const mappedRooms = hotel.rooms_details.map((rd: any, index: number) => {
                    let roomAmenities = rd.amenities || [];
                    if (typeof roomAmenities === 'string') {
                        try {
                            roomAmenities = JSON.parse(roomAmenities);
                        } catch (e) {
                            roomAmenities = [];
                        }
                    }

                    return {
                        id: rd.room_name || `room-${index}`,
                        name: rd.room_name,
                        price: rd.price,
                        amenities: Array.isArray(roomAmenities) ? roomAmenities : [],
                        available: rd.available_rooms,
                        capacity: { adults: 2, children: 1 }, // Default
                        totalInventory: 0
                    };
                });
                updatedHotel.rooms = mappedRooms;
                needsUpdate = true;
            }

            // 2. Map 'hotel_amenities' (CSV string) to 'amenities' (Object Array)
            if ((!updatedHotel.amenities || updatedHotel.amenities.length === 0) && updatedHotel.hotel_amenities) {
                const amenityList = typeof updatedHotel.hotel_amenities === 'string'
                    ? updatedHotel.hotel_amenities.split(',').filter((s: string) => s).map((s: string) => ({ name: s.trim() }))
                    : [];
                updatedHotel.amenities = amenityList;
                needsUpdate = true;
            }

            if (needsUpdate) {
                setHotel(updatedHotel);
            }

            setLoading(false);
            return;
        }

        // Fallback: Fetch details if no state (Direct URL access)
        const fetchDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await CustomerService.getHotelById(id);
                setHotel(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load hotel details. Please search again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleSelectRoom = (room: any) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        setSelectedRoom(room);
        setOpenBooking(true);
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

    const lowestRoomPrice = hotel.rooms && hotel.rooms.length > 0
        ? Math.min(...hotel.rooms.map((r: any) => r.price))
        : hotel.lowestPrice;

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
                        {
                            (hotel.rating ?? 0) >= 4.5 && (
                                <Chip label="Top Rated" color="primary" variant="outlined" />
                            )
                        }
                    </Box >
                </Grid >
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Card sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.50' }}>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                            ₹{lowestRoomPrice}
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
            </Grid >

            {/* Images - Simple Hero for now */}
            < Card sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
                <CardMedia
                    component="img"
                    height="400"
                    image={hotel.images?.[0] || 'https://via.placeholder.com/800x400?text=No+Image'}
                    alt={hotel.name}
                    sx={{ objectFit: 'cover' }}
                />
            </Card >

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
                            {hotel.amenities?.map((amenity: any) => (
                                <Grid item key={amenity.id} xs={6} sm={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                        {getAmenityIcon(amenity.name)}
                                        <Typography variant="body2">{amenity.name}</Typography>
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

            {/* Cleaned up Booking Logic */}
            <BookingDialog
                open={openBooking}
                onClose={() => setOpenBooking(false)}
                hotel={hotel}
                selectedRoom={selectedRoom}
                onSuccess={() => {
                    // Refresh hotel data to update availability?
                    // Fetch details again or just close
                    setOpenBooking(false);
                }}
            />

        </Container >
    );
};

export default HotelDetailsPage;
