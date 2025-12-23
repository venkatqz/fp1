
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Typography, Box, Grid, Card, CardMedia, Button, Chip, Divider,
    CircularProgress, Alert, IconButton
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
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

    // Room quantity selections - Shopping cart style
    const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});

    // Booking State
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
                        id: rd.room_type_id || rd.id || `room-${index}`,  // Use actual room_type_id
                        name: rd.room_name,
                        price: rd.price,
                        amenities: Array.isArray(roomAmenities) ? roomAmenities : [],
                        available: rd.available_rooms,
                        capacity: rd.capacity || 0,
                        totalInventory: 0
                    };
                });
                updatedHotel.rooms = mappedRooms;
                needsUpdate = true;

                // Initialize room quantities to 0
                const initialQuantities: Record<string, number> = {};
                mappedRooms.forEach((room: any) => {
                    initialQuantities[room.id] = 0;
                });
                setRoomQuantities(initialQuantities);
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

    // Room quantity handler - unified function with delta parameter
    const handleQuantityChange = (roomId: string, delta: number, maxAvailable: number) => {
        setRoomQuantities(prev => {
            const currentQty = prev[roomId] || 0;
            const newQty = currentQty + delta;
            return {
                ...prev,
                [roomId]: Math.max(0, Math.min(newQty, maxAvailable))
            };
        });
    };

    // Calculate total selected rooms
    const totalSelectedRooms = Object.values(roomQuantities).reduce((sum, qty) => sum + qty, 0);

    const handleOpenBooking = () => {
        if (totalSelectedRooms === 0) {
            alert('Please select at least one room');
            return;
        }

        const token = sessionStorage.getItem('token');
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
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
                            {hotel.amenities?.map((amenity: any, idx: number) => (
                                <Grid item key={amenity.id || `amenity-${idx}`} xs={6} sm={4}>
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
                                            Capacity: {room.capacity} guest{room.capacity > 1 ? 's' : ''}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {room.available} rooms left
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {room.amenities?.map((am: string, idx: number) => (
                                            <Chip key={`${room.id}-amenity-${idx}`} label={am} size="small" variant="outlined" />
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
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>per night</Typography>

                                    {room.available > 0 ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(room.id, -1, room.available)}
                                                disabled={!roomQuantities[room.id] || roomQuantities[room.id] === 0}
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                            <Typography sx={{
                                                minWidth: 40,
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem',
                                                color: roomQuantities[room.id] > 0 ? 'primary.main' : 'text.secondary'
                                            }}>
                                                {roomQuantities[room.id] || 0}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(room.id, +1, room.available)}
                                                disabled={roomQuantities[room.id] >= room.available}
                                                color="primary"
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="error">
                                            Sold Out
                                        </Typography>
                                    )}

                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                        {room.available} available
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                    {!hotel.rooms?.length && (
                        <Typography variant="body1" color="text.secondary">No rooms available.</Typography>
                    )}
                </Grid>

                {/* Book Now Button - Shows selected rooms */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleOpenBooking}
                        disabled={totalSelectedRooms === 0}
                        sx={{
                            minWidth: 300,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: 2
                        }}
                    >
                        {totalSelectedRooms > 0
                            ? `Book Now (${totalSelectedRooms} room${totalSelectedRooms > 1 ? 's' : ''})`
                            : 'Select Rooms to Continue'}
                    </Button>
                </Box>
            </Box>

            {/* Updated Booking Dialog - Now receives room quantities */}
            <BookingDialog
                open={openBooking}
                onClose={() => setOpenBooking(false)}
                hotel={hotel}
                availableRooms={hotel.rooms || []}
                roomQuantities={roomQuantities}
                onSuccess={async () => {
                    setOpenBooking(false);
                    // Reset quantities after successful booking
                    const resetQuantities: Record<string, number> = {};
                    hotel.rooms?.forEach((room: any) => {
                        resetQuantities[room.id] = 0;
                    });
                    setRoomQuantities(resetQuantities);

                    // Refresh hotel data to show updated availability
                    if (id) {
                        try {
                            const response = await CustomerService.getHotelById(id);
                            if (response.data) {
                                setHotel(response.data);
                            }
                        } catch (err) {
                            console.error('Failed to refresh hotel data:', err);
                        }
                    }
                }}
            />

        </Container >
    );
};

export default HotelDetailsPage;
