import React from 'react';
import {
    Grid,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HotelCard from './HotelCard';
import type { Hotel } from '../client/models/Hotel';

// Extended type to include properties from Search API that might be missing in generated client
interface SearchResultHotel extends Hotel {
    starting_price?: number;
    hotel_amenities?: string;
}

interface HotelListProps {
    hotels: SearchResultHotel[];
    viewMode: 'grid' | 'list';
    onEdit?: (hotel: SearchResultHotel) => void;
    onDelete?: (hotel: SearchResultHotel) => void;
    isManager?: boolean;
}

const HotelList: React.FC<HotelListProps> = ({ hotels, viewMode, onEdit, onDelete, isManager = false }) => {
    if (viewMode === 'grid') {
        return (
            <Grid container spacing={3}>
                {hotels.map((hotel) => (
                    <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                        {/* Cast to any to avoid strict type checks on HotelCard if it expects strict Hotel */}
                        <HotelCard hotel={hotel as any} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="hotel list table">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Amenities</TableCell>
                        {isManager && <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hotels.map((hotel) => (
                        <TableRow
                            key={hotel.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {hotel.images && hotel.images.length > 0 && (
                                        <Box
                                            component="img"
                                            sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                                            src={hotel.images[0]}
                                            alt={hotel.name}
                                        />
                                    )}
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">{hotel.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">ID: {hotel.id?.substring(0, 8)}...</Typography>
                                    </Box>
                                </Box>
                            </TableCell>
                            <TableCell>{hotel.city}</TableCell>
                            <TableCell>
                                <Chip
                                    label={hotel.rating}
                                    size="small"
                                    color={Number(hotel.rating) >= 4 ? 'success' : 'default'}
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell>₹{hotel.starting_price ?? hotel.lowestPrice ?? 0}</TableCell>
                            <TableCell>
                                <Typography variant="caption" color="text.secondary" sx={{
                                    display: '-webkit-box',
                                    overflow: 'hidden',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 1,
                                    maxWidth: 200
                                }}>
                                    {hotel.hotel_amenities || (Array.isArray(hotel.amenities) ? hotel.amenities.map((a: any) => typeof a === 'string' ? a : a.name).join(', ') : '')}
                                </Typography>
                            </TableCell>
                            {isManager && (
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => onEdit?.(hotel)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => onDelete?.(hotel)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default HotelList;
