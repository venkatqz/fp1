import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel,
    Box, Typography, Grid, TextField, DialogActions, Button,
    IconButton, Chip, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { BookingsService, PaymentMode } from '../client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

interface GuestDetail {
    name: string;
    email: string;
    phone: string;
}

interface BookingDialogProps {
    open: boolean;
    onClose: () => void;
    hotel: any;
    availableRooms: any[];
    roomQuantities: Record<string, number>;  // Pre-selected quantities from parent
    onSuccess: () => void;
}

const BookingDialog: React.FC<BookingDialogProps> = ({ open, onClose, hotel, availableRooms, roomQuantities, onSuccess }) => {
    const { user } = useAuth();
    const { showToast } = useUI();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form State
    const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    const [guests, setGuests] = useState(2);

    // Build room selections from pre-selected quantities (passed from parent)
    const roomSelections = availableRooms
        .filter(room => roomQuantities[room.id] > 0)
        .map(room => ({
            roomTypeId: room.id,
            roomName: room.name,
            price: room.price,
            quantity: roomQuantities[room.id],
            maxAvailable: room.available
        }));

    // Multiple guest details
    const [guestDetails, setGuestDetails] = useState<GuestDetail[]>([
        { name: '', email: '', phone: '' }
    ]);

    const [intentData, setIntentData] = useState<any>(null);

    useEffect(() => {
        if (user && open) {
            // Pre-fill first guest with user details
            setGuestDetails([{
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }]);
        }
    }, [user, open]);

    // Calculate totals
    const totalRooms = roomSelections.reduce((sum, room) => sum + room.quantity, 0);
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)) || 1;
    const totalPrice = roomSelections.reduce((sum, room) =>
        sum + (room.price * room.quantity * nights), 0
    );

    const handleAddGuest = () => {
        setGuestDetails([...guestDetails, { name: '', email: '', phone: '' }]);
    };

    const handleRemoveGuest = (index: number) => {
        if (guestDetails.length > 1) {
            setGuestDetails(guestDetails.filter((_, i) => i !== index));
        }
    };

    const handleGuestChange = (index: number, field: keyof GuestDetail, value: string) => {
        const updated = [...guestDetails];
        updated[index][field] = value;
        setGuestDetails(updated);
    };

    const handleCreateIntent = async () => {
        // Validate at least one room selected
        if (totalRooms === 0) {
            showToast({ message: 'Please select at least one room', type: 'warning' });
            return;
        }

        // Validate at least one guest has all details
        const hasValidGuest = guestDetails.some(g => g.name && g.email && g.phone);
        if (!hasValidGuest) {
            showToast({ message: 'Please fill in at least one complete guest detail', type: 'warning' });
            return;
        }

        try {
            setLoading(true);

            // Build rooms array (only include rooms with quantity > 0)
            const selectedRooms = roomSelections
                .filter(room => room.quantity > 0)
                .map(room => ({
                    roomTypeId: room.roomTypeId,
                    quantity: room.quantity
                }));

            const payload = {
                hotelId: hotel.id,
                rooms: selectedRooms,  // Send array of rooms
                checkIn,
                checkOut,
                guests,
                paymentMode: PaymentMode.ONLINE
            };

            // @ts-ignore - Backend supports both formats (rooms[] or roomTypeId), client types not yet updated
            const response = await BookingsService.createBookingIntent(payload);
            if (response.data) {
                setIntentData(response.data);
                setActiveStep(1);
            } else {
                throw new Error("No data returned");
            }
        } catch (error: any) {
            console.error(error);
            showToast({
                message: error.body?.message || error.message || 'Failed to initiate booking',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!intentData) return;
        try {
            setLoading(true);

            // Filter out incomplete guest details
            const completeGuests = guestDetails.filter(g => g.name && g.email && g.phone);

            await BookingsService.confirmBooking({
                bookingId: intentData.bookingId,
                paymentIntentId: intentData.paymentIntentId,
                guestDetails: completeGuests
            });
            setActiveStep(2);
            onSuccess();
        } catch (error: any) {
            console.error(error);
            showToast({
                message: error.body?.message || error.message || 'Booking confirmation failed',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Complete your Booking</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
                    <Step><StepLabel>Details</StepLabel></Step>
                    <Step><StepLabel>Payment</StepLabel></Step>
                    <Step><StepLabel>Confirmed</StepLabel></Step>
                </Stepper>

                {activeStep === 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>{hotel?.name}</Typography>

                        {/* Step 1: Selected Rooms Summary */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Selected Rooms
                            </Typography>
                            {roomSelections.map((room) => (
                                <Card key={room.roomTypeId} sx={{ mb: 2, bgcolor: 'grey.50' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">{room.roomName}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ₹{room.price}/night × {room.quantity} room{room.quantity > 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={`₹${(room.price * room.quantity * nights).toLocaleString()}`}
                                                color="primary"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                            <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                                <Typography variant="body2" fontWeight="bold">
                                    Total: {totalRooms} room{totalRooms > 1 ? 's' : ''} × {nights} night{nights > 1 ? 's' : ''}
                                </Typography>
                                <Typography variant="h5" color="primary" fontWeight="bold">
                                    ₹{totalPrice.toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Step 2: Check-in/Check-out */}
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Dates
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                                <TextField label="Check-in" type="date" fullWidth size="small" value={checkIn} onChange={e => setCheckIn(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Check-out" type="date" fullWidth size="small" value={checkOut} onChange={e => setCheckOut(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Number of Guests" type="number" fullWidth size="small" value={guests} onChange={e => setGuests(Number(e.target.value))} />
                            </Grid>
                        </Grid>

                        {/* Step 3: Guest Details */}
                        <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight="bold">Guest Details</Typography>
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleAddGuest}
                                variant="outlined"
                            >
                                Add Guest
                            </Button>
                        </Box>

                        {guestDetails.map((guest, index) => (
                            <Box key={index} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Guest {index + 1}
                                    </Typography>
                                    {guestDetails.length > 1 && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveGuest(index)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Name"
                                            fullWidth
                                            size="small"
                                            value={guest.name}
                                            onChange={e => handleGuestChange(index, 'name', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Email"
                                            fullWidth
                                            size="small"
                                            value={guest.email}
                                            onChange={e => handleGuestChange(index, 'email', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Phone"
                                            fullWidth
                                            size="small"
                                            value={guest.phone}
                                            onChange={e => handleGuestChange(index, 'phone', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Box>
                )}

                {activeStep === 1 && intentData && (
                    <Box>
                        <Typography variant="h6" color="success.main" gutterBottom>Ready to Pay</Typography>
                        <Typography variant="body1">Total: {intentData.currency} {intentData.totalPrice}</Typography>
                        <Box sx={{ mt: 2, p: 3, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
                            [ Mock Payment Gateway ]
                        </Box>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h5" color="success.main" fontWeight="bold">Booking Confirmed!</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>Check your email for details.</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                {activeStep !== 2 && <Button onClick={onClose}>Cancel</Button>}
                {activeStep === 1 && <Button onClick={() => setActiveStep(0)}>Back</Button>}
                {activeStep === 0 && <Button variant="contained" onClick={handleCreateIntent} disabled={loading}>{loading ? 'Processing...' : 'Review & Pay'}</Button>}
                {activeStep === 1 && <Button variant="contained" color="success" onClick={handleConfirmBooking} disabled={loading}>{loading ? 'Confirming...' : 'Pay Now'}</Button>}
                {activeStep === 2 && <Button variant="contained" onClick={onClose}>Done</Button>}
            </DialogActions>
        </Dialog>
    );
};

export default BookingDialog;
