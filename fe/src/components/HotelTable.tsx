import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Hotel } from '../client/models/Hotel';

interface HotelTableRowProps {
    hotel: Hotel & { starting_price?: number; hotel_amenities?: string };
    isManager?: boolean;
    onEdit?: (hotel: Hotel) => void;
    onDelete?: (hotel: Hotel) => void;
}

const HotelTableRow: React.FC<HotelTableRowProps> = ({ hotel, isManager = false, onEdit, onDelete }) => {
    const navigate = useNavigate();

    // Parse images if they're stored as JSON string
    let images = hotel.images;
    if (typeof images === 'string') {
        try {
            images = JSON.parse(images);
        } catch (e) {
            images = [];
        }
    }

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {images && Array.isArray(images) && images.length > 0 && (
                        <Box
                            component="img"
                            sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                            src={images[0]}
                            alt={hotel.name}
                        />
                    )}
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{hotel.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            ID: {hotel.id?.substring(0, 8)}...
                        </Typography>
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
                    {hotel.hotel_amenities || (Array.isArray(hotel.amenities)
                        ? hotel.amenities.map((a: any) => typeof a === 'string' ? a : a.name).join(', ')
                        : '')}
                </Typography>
            </TableCell>
            <TableCell align="right">
                {isManager ? (
                    // Manager actions: Edit & Delete
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
                ) : (
                    // Customer action: View button
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/hotel/${hotel.id}`, { state: { hotel } })}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: 80
                        }}
                    >
                        View
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
};

interface HotelTableProps {
    hotels: (Hotel & { starting_price?: number; hotel_amenities?: string })[];
    isManager?: boolean;
    onEdit?: (hotel: Hotel) => void;
    onDelete?: (hotel: Hotel) => void;
}

const HotelTable: React.FC<HotelTableProps> = ({ hotels, isManager = false, onEdit, onDelete }) => {
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
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">
                            {isManager ? 'Actions' : 'Details'}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hotels.map((hotel) => (
                        <HotelTableRow
                            key={hotel.id}
                            hotel={hotel}
                            isManager={isManager}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default HotelTable;
