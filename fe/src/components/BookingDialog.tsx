import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel,
    Box, Typography, Grid, TextField, DialogActions, Button, CircularProgress
} from '@mui/material';
import { BookingsService } from '../client';
import { useAuth } from '../context/AuthContext';

interface BookingDialogProps {
    open: boolean;
    onClose: () => void;
    hotel: any;
    selectedRoom: any;
    onSuccess: () => void;
}

const BookingDialog: React.FC<BookingDialogProps> = ({ open, onClose, hotel, selectedRoom, onSuccess }) => {
    const { user } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form State
    const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    const [guests, setGuests] = useState(2);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    const [intentData, setIntentData] = useState<any>(null);

    useEffect(() => {
        if (user) {
            setGuestName(user.name || '');
            setGuestEmail(user.email || '');
            setGuestPhone(user.phone || '');
        }
    }, [user, open]); // Reset/Fill when dialog opens

    const handleCreateIntent = async () => {
        if (!guestName || !guestEmail || !guestPhone) {
            alert('Please fill in all guest details');
            return;
        }

        try {
            setLoading(true);
            const response = await BookingsService.createBookingIntent({
                hotelId: hotel.id,
                roomTypeId: selectedRoom.id,
                checkIn,
                checkOut,
                guests
            });
            console.log("Intent confirmed", response);
            if (response.data) {
                setIntentData(response.data);
                setActiveStep(1);
            } else {
                throw new Error("No data returned");
            }
        } catch (error: any) {
            console.error(error);
            alert('Failed to initiate booking: ' + (error.body?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!intentData) return;
        try {
            setLoading(true);
            await BookingsService.confirmBooking({
                bookingId: intentData.bookingId,
                paymentIntentId: intentData.paymentIntentId,
                guestDetails: {
                    name: guestName,
                    email: guestEmail,
                    phone: guestPhone
                }
            });
            setActiveStep(2);
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Booking failed: ' + (error.body?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Complete your Booking</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
                    <Step><StepLabel>Details</StepLabel></Step>
                    <Step><StepLabel>Payment</StepLabel></Step>
                    <Step><StepLabel>Confirmed</StepLabel></Step>
                </Stepper>

                {activeStep === 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>{selectedRoom?.name}</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {hotel?.name}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField label="Check-in" type="date" fullWidth size="small" value={checkIn} onChange={e => setCheckIn(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Check-out" type="date" fullWidth size="small" value={checkOut} onChange={e => setCheckOut(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Guest Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField label="Name" fullWidth size="small" value={guestName} onChange={e => setGuestName(e.target.value)} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Email" fullWidth size="small" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Phone" fullWidth size="small" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Guests" type="number" fullWidth size="small" value={guests} onChange={e => setGuests(Number(e.target.value))} />
                            </Grid>
                        </Grid>

                        {/* Price Estimate */}
                        <Box sx={{ mt: 3, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle2">Estimated Total</Typography>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                                ₹{(selectedRoom?.price * guests * Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)))).toLocaleString()}
                            </Typography>
                        </Box>
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
                {activeStep === 0 && <Button variant="contained" onClick={handleCreateIntent} disabled={loading}>{loading ? 'Processing...' : 'Review & Pay'}</Button>}
                {activeStep === 1 && <Button variant="contained" color="success" onClick={handleConfirmBooking} disabled={loading}>{loading ? 'Confirming...' : 'Pay Now'}</Button>}
                {activeStep === 2 && <Button variant="contained" onClick={onClose}>Done</Button>}
            </DialogActions>
        </Dialog>
    );
};

export default BookingDialog;
