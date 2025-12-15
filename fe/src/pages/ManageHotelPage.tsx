import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert, CircularProgress } from '@mui/material';
import HotelForm, { type HotelFormData } from '../components/HotelForm';
import { HotelsService } from '../client';

const ManageHotelPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = id && id !== 'new';

    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<HotelFormData | undefined>(undefined);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchHotelDetails();
        }
    }, [id]);

    const fetchHotelDetails = async () => {
        try {
            setIsLoading(true);
            const hotel = await HotelsService.getHotelById(id!);
            setInitialData(hotel as unknown as HotelFormData); // Casting for simplicity
        } catch (err) {
            console.error(err);
            setError('Failed to fetch hotel details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (data: HotelFormData) => {
        try {
            setIsLoading(true);
            setError('');

            const url = isEditMode
                ? `http://localhost:3000/hotels/${id}`
                : 'http://localhost:3000/hotels';

            const method = isEditMode ? 'PUT' : 'POST';

            // Manual fetch since service is auto-generated and valid for reads only
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save hotel');

            navigate('/search');
        } catch (err) {
            console.error(err);
            setError('Failed to save hotel. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditMode && isLoading && !initialData) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <HotelForm
                title={isEditMode ? 'Edit Hotel' : 'Add New Hotel'}
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </Container>
    );
};

export default ManageHotelPage;
