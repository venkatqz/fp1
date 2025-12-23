import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import HotelList from '../components/HotelList';
import { ManagerService } from '../client/services/ManagerService';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import type { Hotel } from '../client/models/Hotel';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`manager-tabpanel-${index}`}
            aria-labelledby={`manager-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { showLoader, hideLoader, showToast } = useUI();
    const [tabValue, setTabValue] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Prevent infinite loops


    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await ManagerService.getMyHotels();
            if (response.status && response.data) {
                setHotels(response.data);
            }
        } catch (err: any) {
            console.error('Fetch hotels error:', err);
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await ManagerService.getManagerBookings();
            if (response.status && response.data) {
                setBookings(response.data);
            }
        } catch (err: any) {
            console.error('Fetch bookings error:', err);
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (err: any) => {
        // Global handler in App.tsx will catch the 401/403 event dispatch from request.ts
        // We just need to ensure we don't show duplicate errors here
        if (err.status !== 401 && err.status !== 403) {
            console.error('API Error:', err);
            setError('Failed to fetch data');
        }
    };

    useEffect(() => {
        // Only fetch if user is authenticated
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (tabValue === 0) {
            fetchHotels();
        } else {
            fetchBookings();
        }
    }, [tabValue, isAuthenticated]);

    const handleEditHotel = (hotel: Hotel) => {
        navigate(`/admin/hotel/${hotel.id}`);
    };

    const handleDeleteHotel = async (hotel: Hotel) => {
        if (!window.confirm(`Are you sure you want to delete ${hotel.name}?`)) return;

        try {
            showLoader();
            await ManagerService.deleteHotel(hotel.id);
            showToast({ type: 'success', msg: 'Hotel deleted successfully' });
            fetchHotels(); // Refresh list
        } catch (err) {
            console.error(err);
            showToast({ type: 'error', msg: 'Failed to delete hotel' });
        } finally {
            hideLoader();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'success';
            case 'PENDING_PAYMENT': return 'warning';
            case 'CANCELLED': return 'error';
            case 'COMPLETED': return 'info';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Manager Dashboard
                </Typography>

                {tabValue === 0 && (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(_, newMode) => newMode && setViewMode(newMode)}
                            size="small"
                            aria-label="view mode"
                        >
                            <ToggleButton value="grid" aria-label="grid view">
                                <ViewModuleIcon />
                            </ToggleButton>
                            <ToggleButton value="list" aria-label="list view">
                                <ViewListIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/admin/hotel/new')}
                        >
                            Add New Hotel
                        </Button>
                    </Box>
                )}
            </Box>

            <Tabs value={tabValue} onChange={handleTabChange} aria-label="manager tabs" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tab label="My Hotels" />
                <Tab label="Bookings" />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <CustomTabPanel value={tabValue} index={0}>
                {loading ? <CircularProgress /> : (
                    <>
                        {hotels.length === 0 ? (
                            <Typography color="text.secondary">You haven't added any hotels yet.</Typography>
                        ) : (
                            <HotelList
                                hotels={hotels as any}
                                viewMode={viewMode}
                                isManager={true}
                                onEdit={handleEditHotel}
                                onDelete={handleDeleteHotel}
                            />
                        )}
                    </>
                )}
            </CustomTabPanel>

            <CustomTabPanel value={tabValue} index={1}>
                {loading ? <CircularProgress /> : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Hotel</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Guest</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Check In/Out</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Rooms</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Total Price</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell>{booking.hotelName}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{booking.guestName}</Typography>
                                                <Typography variant="caption" display="block">{booking.guestEmail}</Typography>
                                                <Typography variant="caption" display="block">{booking.guestPhone}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{new Date(booking.checkIn).toLocaleDateString()}</Typography>
                                            <Typography variant="caption" color="text.secondary">to</Typography>
                                            <Typography variant="body2">{new Date(booking.checkOut).toLocaleDateString()}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {/* Parse rooms summary if it's a JSON string string, or display as is */}
                                            {booking.rooms}
                                        </TableCell>
                                        <TableCell>₹{booking.totalPrice}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.status}
                                                color={getStatusColor(booking.status)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {bookings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No bookings found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CustomTabPanel>

        </Container>
    );
}
