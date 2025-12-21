
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Alert,
    Pagination,
    Button,
    TablePagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    type SelectChangeEvent,
} from '@mui/material';
import HotelList from '../components/HotelList';
import { CustomerService, ApiError } from '../client';
import type { Hotel } from '../client/models/Hotel';

import { useUI } from '../context/UIContext';
// ...
export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hotels, setHotels] = useState<Hotel[]>([]);
    // Removed local loading state to test GlobalLoader
    const { showLoader, hideLoader, showToast } = useUI();
    const [error, setError] = useState('');
    const [authError, setAuthError] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Read URL params
    const search = searchParams.get('search') || '';
    const queryParam = searchParams.get('query') || search;
    const checkIn = searchParams.get('checkIn') || undefined;
    const checkOut = searchParams.get('checkOut') || undefined;
    const guests = searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const page = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        fetchHotels();
    }, [searchParams, rowsPerPage]);

    const fetchHotels = async () => {
        try {
            showLoader();
            setError('');
            setAuthError(false);


            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

            const response = await CustomerService.searchAvailableHotels(
                queryParam || '',
                checkIn || today,
                checkOut || tomorrow,
                guests || 1,
                (sortBy as any) || 'rating',
                page,
                rowsPerPage
            );

            const result = response as any;

            if (result.status && result.data) {
                if (result.data.data && Array.isArray(result.data.data)) {
                    setHotels(result.data.data);
                    const total = result.data.meta?.total || 0;
                    setTotalCount(total);
                    setTotalPages(Math.ceil(total / rowsPerPage));
                } else if (Array.isArray(result.data)) {
                    setHotels(result.data);
                    setTotalCount(result.data.length);
                    setTotalPages(1);
                }
            } else {
                console.warn('Response format unexpected:', result);
                setHotels([]);
                showToast({ type: 'warning', msg: 'Unexpected response format' });
            }

        } catch (err) {
            console.error('Fetch error:', err);

            if (err instanceof ApiError && err.status === 401) {
                setAuthError(true);
                showToast({ type: 'error', msg: 'Please login to search' });
            } else {
                setError('Failed to fetch hotels. Is the backend running?');
                showToast({ type: 'error', msg: 'Failed to fetch hotels' });
            }
        } finally {
            hideLoader();
        }
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        // Prepare new params, preserving current search/city
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(value));
        setSearchParams(newParams);
        window.scrollTo(0, 0);
    };

    const handleTablePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(newPage + 1)); // Convert 0-based to 1-based
        setSearchParams(newParams);
        window.scrollTo(0, 0);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Search Header - REMOVED local search bar, using Navbar one */}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {queryParam ? `Results for "${queryParam}"` : 'All Hotels'}
                </Typography>

                <Box sx={{ minWidth: 200 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="sort-by-label">Sort By</InputLabel>
                        <Select
                            labelId="sort-by-label"
                            id="sort-by-select"
                            value={sortBy || 'rating'}
                            label="Sort By"
                            onChange={(e: SelectChangeEvent) => {
                                const newParams = new URLSearchParams(searchParams);
                                newParams.set('sortBy', e.target.value as string);
                                setSearchParams(newParams);
                            }}
                        >
                            <MenuItem value="rating">Rating</MenuItem>
                            <MenuItem value="price_low">Price: Low to High</MenuItem>
                            <MenuItem value="price_high">Price: High to Low</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Auth Error State */}
            {authError && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Please sign in to view availability and search results.
                    </Typography>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        Sign In / Sign Up
                    </Button>
                </Box>
            )}

            {/* Generic Error State */}
            {error && !authError && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Loading State Removed - Using GlobalLoader */}
            {!authError && (
                <>
                    {/* Results Grid - Now Reusable! */}
                    <HotelList hotels={hotels} viewMode="grid" />


                    {/* Empty State */}
                    {hotels.length === 0 && (
                        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
                            No hotels found. Try a different search.
                        </Typography>
                    )}

                    {/* Pagination */}
                    {hotels.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 6, width: '100%' }}>
                            <TablePagination
                                component="div"
                                count={totalCount}
                                page={page - 1}
                                onPageChange={handleTablePageChange}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[2, 10, 25, 50, 100]}
                                ActionsComponent={() => null}
                                labelDisplayedRows={() => null}
                                sx={{
                                    border: 'none',
                                    '.MuiTablePagination-toolbar': { pl: 0 } // Remove default left padding
                                }}
                            />
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
}
