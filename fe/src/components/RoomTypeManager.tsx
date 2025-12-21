import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ManagerService } from '../client/services/ManagerService';
import type { RoomType } from '../client/models/RoomType';
import { useUI } from '../context/UIContext';

interface RoomTypeManagerProps {
    hotelId: string;
    rooms: RoomType[];
    onUpdate: () => void; // Callback to refresh parent data
}

const RoomTypeManager: React.FC<RoomTypeManagerProps> = ({ hotelId, rooms, onUpdate }) => {
    const { showToast } = useUI();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);

    const [formData, setFormData] = useState<Partial<RoomType>>({
        name: '',
        price: 0,
        capacity: 2,
        totalInventory: 1,
        images: [],
        amenities: []
    });

    const handleOpen = (room?: RoomType) => {
        if (room) {
            setEditingRoom(room);
            setFormData(room);
        } else {
            setEditingRoom(null);
            setFormData({
                name: '',
                price: 0,
                capacity: 2,
                totalInventory: 1,
                images: [],
                amenities: []
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingRoom(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'capacity' || name === 'totalInventory' ? Number(value) : value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload: any = {
                ...formData,
                hotelId: hotelId
            };

            // If editing, payload should include ID (though upsert uses ID in body)
            if (editingRoom) {
                payload.id = editingRoom.id;
            }

            await ManagerService.createRoomType(payload);
            showToast({ type: 'success', msg: `Room Type ${editingRoom ? 'updated' : 'created'} successfully` });
            handleClose();
            onUpdate();
        } catch (err: any) {
            console.error(err);
            showToast({ type: 'error', msg: err.message || 'Failed to save room type' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (roomTypeId: string) => {
        if (!window.confirm('Are you sure you want to delete this room type?')) return;
        try {
            setLoading(true);
            await ManagerService.deleteRoomType(roomTypeId);
            showToast({ type: 'success', msg: 'Room Type deleted' });
            onUpdate();
        } catch (err: any) {
            console.error(err);
            showToast({ type: 'error', msg: err.message || 'Failed to delete room type' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Room Types
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Room Type
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Inventory</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rooms.map((room) => (
                            <TableRow key={room.id}>
                                <TableCell>{room.name}</TableCell>
                                <TableCell>₹{room.price}</TableCell>
                                <TableCell>{room.capacity}</TableCell>
                                <TableCell>{room.totalInventory}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(room)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(room.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {rooms.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No room types added yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editingRoom ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Room Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Price (₹)"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Capacity"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Total Inventory"
                                name="totalInventory"
                                value={formData.totalInventory}
                                onChange={handleChange}
                            />
                        </Grid>
                        {/* Note: Amenities and Images fields can be added here similar to HotelForm */}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RoomTypeManager;
