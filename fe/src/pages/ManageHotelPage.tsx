import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert, CircularProgress, Divider } from '@mui/material';
import HotelForm, { type HotelFormData } from '../components/HotelForm';
import { CustomerService } from '../client';
import { ManagerService } from '../client/services/ManagerService';
import type { Hotel } from '../client/models/Hotel';
import { useUI } from '../context/UIContext';
import RoomTypeManager from '../components/RoomTypeManager';

const ManageHotelPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useUI();
    const isEditMode = id && id !== 'new';

    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<HotelFormData | undefined>(undefined);
    const [fullHotelData, setFullHotelData] = useState<Hotel | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchHotelDetails();
        }
    }, [id]);

    const fetchHotelDetails = async () => {
        try {
            setIsLoading(true);
            const hotel = await CustomerService.getHotelById(id!);
            if (hotel.data) {
                setFullHotelData(hotel.data);
                // Map Hotel to HotelFormData
                const formData: HotelFormData = {
                    name: hotel.data.name,
                    city: hotel.data.city,
                    address: hotel.data.address || '',
                    description: hotel.data.description || '',
                    lowestPrice: hotel.data.lowestPrice || '',
                    rating: hotel.data.rating || '',
                    amenities: hotel.data.amenities?.map((a: any) => typeof a === 'string' ? a : a.name) || [],
                    images: hotel.data.images || []
                };
                setInitialData(formData);
            }
        } catch (err: any) {
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

            const payload: any = {
                ...data,
                // If edit mode, include ID
                ...(isEditMode ? { id } : {})
            };

            await ManagerService.createHotel(payload);
            showToast({ type: 'success', msg: `Hotel ${isEditMode ? 'updated' : 'created'} successfully` });

            if (!isEditMode) {
                navigate('/manager/dashboard');
            } else {
                // Refresh details to reflect changes
                fetchHotelDetails();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to save hotel. Please try again.');
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

            {isEditMode && fullHotelData && (
                <>
                    <Divider sx={{ my: 4 }} />
                    <RoomTypeManager
                        hotelId={id!}
                        rooms={fullHotelData.rooms || []}
                        onUpdate={fetchHotelDetails}
                    />
                </>
            )}
        </Container>
    );
};

export default ManageHotelPage;
