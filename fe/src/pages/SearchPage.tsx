
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Pagination,
    Stack,
    Button,
} from '@mui/material';
import HotelCard from '../components/HotelCard';
import { HotelsService, ApiError } from '../client';
import type { Hotel } from '../client/models/Hotel';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authError, setAuthError] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

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
    }, [searchParams]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            setError('');
            setAuthError(false);

            // Use HotelsService for /hotels/search endpoint
            // Provide defaults for dates if missing to ensure availability check works
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

            const response = await HotelsService.searchAvailableHotels(
                queryParam || '',
                checkIn || today,
                checkOut || tomorrow,
                guests || 1,
                (sortBy as any) || 'rating',
                page,
                12
            );

            // Cast response to any to handle structure mismatch (generated type vs actual backend return)
            const result = response as any;

            if (result.status && result.data) {
                // Backend returns { data: { data: [...], meta: ... } }
                if (result.data.data && Array.isArray(result.data.data)) {
                    setHotels(result.data.data);
                    const total = result.data.meta?.total || 0;
                    setTotalPages(Math.ceil(total / 12));
                } else if (Array.isArray(result.data)) {
                    // Fallback for simple array
                    setHotels(result.data);
                    setTotalPages(1);
                }
            } else {
                console.warn('Response format unexpected:', result);
                setHotels([]);
            }

        } catch (err) {
            console.error('Fetch error:', err);

            if (err instanceof ApiError && err.status === 401) {
                setAuthError(true);
            } else {
                setError('Failed to fetch hotels. Is the backend running?');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        // Prepare new params, preserving current search/city
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(value));
        setSearchParams(newParams);
        window.scrollTo(0, 0);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Search Header - REMOVED local search bar, using Navbar one */}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {queryParam ? `Results for "${queryParam}"` : 'All Hotels'}
                </Typography>

                <Box>
                    <Typography variant="caption" sx={{ mr: 1 }}>Sort By:</Typography>
                    <select
                        style={{ padding: '8px', borderRadius: '4px' }}
                        value={sortBy || 'rating'}
                        onChange={(e) => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('sortBy', e.target.value);
                            setSearchParams(newParams);
                        }}
                    >
                        <option value="rating">Rating</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                    </select>
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

            {/* Loading State */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : !authError && (
                <>
                    {/* Results Grid */}
                    <Grid container spacing={3}>
                        {Array.isArray(hotels) && hotels.map((hotel) => (
                            <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                                {/* 
                  Mapping API Hotel to the Props expected by HotelCard via 'any' 
                  or ensuring HotelCard matches the API type.
                  For now, we pass the API object directly.
                */}
                                <HotelCard
                                    hotel={hotel}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {/* Empty State */}
                    {!loading && hotels.length === 0 && (
                        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
                            No hotels found. Try a different search.
                        </Typography>
                    )}

                    {/* Pagination */}
                    {hotels.length > 0 && (
                        <Stack spacing={2} alignItems="center" sx={{ mt: 6 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Stack>
                    )}
                </>
            )}
        </Container>
    );
}
