
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Pagination,
    Stack,
} from '@mui/material';
import HotelCard from '../components/HotelCard';
import { HotelsService } from '../client';
import type { Hotel } from '../client/models/Hotel';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
            const response = await HotelsService.getHotels(
                queryParam || undefined,
                undefined, // city - generic query handles this
                checkIn,
                checkOut,
                guests,
                sortBy as any, // Cast to expected enum string
                undefined, // minPrice
                undefined, // maxPrice
                page,
                12 // limit
            );

            const result = response as any;

            if (result.data) {
                setHotels(result.data);
                const total = result.meta?.total || 0;
                setTotalPages(Math.ceil(total / 12));
            } else {
                console.warn('Response format unexpected:', result);
            }

        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch hotels. Is the backend running?');
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

            {/* Error State */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Loading State */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Results Grid */}
                    <Grid container spacing={3}>
                        {hotels.map((hotel) => (
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
