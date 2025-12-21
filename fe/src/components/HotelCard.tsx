import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Button,
    Box,
    Chip,
    Stack,
    Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Hotel } from '../client/models/Hotel';

interface HotelCardProps {
    hotel: Hotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
    const navigate = useNavigate();

    // Fallback image if empty
    const mainImage = (hotel.images && hotel.images.length > 0)
        ? hotel.images[0]
        : 'https://placehold.co/600x400?text=No+Image';

    return (
        <Card
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 4,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: 'transparent'
                }
            }}
        >
            {/* 1. Hotel Image - Full Width on Top */}
            <Box sx={{ position: 'relative', width: '100%', height: 240 }}>
                <CardMedia
                    component="img"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    image={mainImage}
                    alt={hotel.name}
                />
                {/* Top Rated Badge - only if rating >= 4.5 */}
                {(hotel.rating ?? 0) >= 4.5 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            bgcolor: 'background.paper',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            boxShadow: 1
                        }}
                    >
                        Top Rated
                    </Box>
                )}
                {/* Rating Badge Overlay */}
                {hotel.rating && (
                    <Box sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        color: 'primary.main',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        ★ {hotel.rating}
                    </Box>
                )}
            </Box>

            {/* 2. Hotel Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CardContent sx={{ flex: '1 0 auto', p: 3 }}>

                    <Typography variant="h6" component="h3" fontWeight={800} gutterBottom sx={{ lineHeight: 1.2 }}>
                        {hotel.name}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', mb: 2 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                            {hotel.city}
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {hotel.description || "Experience luxury and comfort at its finest."}
                    </Typography>

                    {hotel.amenities && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 'auto' }}>
                            {hotel.amenities.slice(0, 3).map((amenity) => (
                                <Chip
                                    key={amenity.id}
                                    label={amenity.name}
                                    size="small"
                                    sx={{
                                        borderRadius: 1,
                                        bgcolor: 'primary.50',
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        border: 'none',
                                        height: 24
                                    }}
                                />
                            ))}
                        </Stack>
                    )}
                </CardContent>

                {/* 3. Footer / Price */}
                <Box sx={{
                    p: 2,
                    px: 3,
                    bgcolor: 'grey.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Box>
                        <Stack direction="row" alignItems="baseline" spacing={0.5}>
                            <Typography variant="h5" color="text.primary" fontWeight="800">
                                ₹{hotel.lowestPrice?.toLocaleString() ?? 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                /night
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Using onClick handler for navigation */}
                    <Button
                        onClick={() => {
                            console.log('View button clicked for hotel:', hotel.id, hotel.name);
                            if (!hotel.id) {
                                console.error('Hotel ID is missing!');
                                alert('Error: Hotel ID is missing');
                                return;
                            }
                            navigate(`/hotel/${hotel.id}`, { state: { hotel } });
                        }}
                        variant="contained"
                        disableElevation
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700
                        }}
                    >
                        View
                    </Button>
                </Box>
            </Box>
        </Card>
    );
};

export default HotelCard;
