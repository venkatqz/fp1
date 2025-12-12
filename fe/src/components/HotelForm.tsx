import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    Paper,
    Divider,
    IconButton,
    MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

export interface HotelFormData {
    name: string;
    city: string;
    address: string;
    description: string;
    lowestPrice: number | ''; // Allow empty string for controlled input
    rating: number | '';      // Allow empty string for controlled input
    amenities: string[];
    images: string[];
}

interface HotelFormProps {
    initialData?: HotelFormData;
    onSubmit: (data: HotelFormData) => void;
    isLoading?: boolean;
    title?: string;
}

const DEFAULT_FORM_DATA: HotelFormData = {
    name: '',
    city: '',
    address: '',
    description: '',
    lowestPrice: '', // Start empty
    rating: '',      // Start empty
    amenities: ['Wifi'],
    images: ['https://via.placeholder.com/600x400'],
};

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Manali', 'Other'];
const COMMON_AMENITIES = ['Wifi', 'Pool', 'Spa', 'Gym', 'Bar', 'Restaurant', 'Parking', 'Beach Access'];

const HotelForm: React.FC<HotelFormProps> = ({ initialData, onSubmit, isLoading = false, title = 'Manage Hotel' }) => {
    const [formData, setFormData] = useState<HotelFormData>(DEFAULT_FORM_DATA);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const [customCity, setCustomCity] = useState('');
    const [newAmenity, setNewAmenity] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.city && !CITIES.includes(initialData.city)) {
                setCustomCity(initialData.city);
                setFormData(prev => ({ ...prev, city: 'Other' }));
            }
        }
    }, [initialData]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';

        if (formData.city === 'Other' && !customCity.trim()) newErrors.city = 'Please specify the city';
        else if (!formData.city) newErrors.city = 'City is required';

        if (formData.lowestPrice === '' || Number(formData.lowestPrice) < 0) newErrors.lowestPrice = 'Valid price is required';
        if (formData.rating === '' || Number(formData.rating) < 0 || Number(formData.rating) > 5) newErrors.rating = 'Rating must be between 0 and 5';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value && !formData.amenities.includes(value)) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, value]
            }));
        }
    };

    const handleAddCustomAmenity = () => {
        if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, newAmenity.trim()]
            }));
            setNewAmenity('');
        }
    };

    const removeAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter(a => a !== amenity)
        }));
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImage = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const submissionData = {
                ...formData,
                city: formData.city === 'Other' ? customCity : formData.city,
                lowestPrice: Number(formData.lowestPrice),
                rating: Number(formData.rating)
            };
            onSubmit(submissionData as HotelFormData);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                {title}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Basic Info */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Hotel Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            error={!!errors.city}
                            helperText={errors.city}
                        >
                            {CITIES.map((city) => (
                                <MenuItem key={city} value={city}>
                                    {city}
                                </MenuItem>
                            ))}
                        </TextField>
                        {formData.city === 'Other' && (
                            <TextField
                                fullWidth
                                label="Specify City"
                                value={customCity}
                                onChange={(e) => setCustomCity(e.target.value)}
                                sx={{ mt: 2 }}
                                required
                                error={!!errors.city}
                            />
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Price per Night (₹)"
                            name="lowestPrice"
                            value={formData.lowestPrice}
                            onChange={handleChange}
                            required
                            error={!!errors.lowestPrice}
                            helperText={errors.lowestPrice}
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Rating (0-5)"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            required
                            error={!!errors.rating}
                            helperText={errors.rating}
                            InputProps={{ inputProps: { min: 0, max: 5, step: 0.1 } }}
                        />
                    </Grid>

                    {/* Amenities */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Amenities
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            {formData.amenities.map((amenity) => (
                                <Box
                                    key={amenity}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        bgcolor: 'primary.50',
                                        color: 'primary.main',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {amenity}
                                    <IconButton size="small" onClick={() => removeAmenity(amenity)} sx={{ ml: 0.5, p: 0.2 }}>
                                        <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                select
                                fullWidth
                                label="Select Amenity"
                                value=""
                                onChange={handleAmenityChange}
                                size="small"
                                sx={{ flex: 1 }}
                            >
                                {COMMON_AMENITIES.filter(a => !formData.amenities.includes(a)).map((amenity) => (
                                    <MenuItem key={amenity} value={amenity}>
                                        {amenity}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                placeholder="Or type new..."
                                size="small"
                                value={newAmenity}
                                onChange={(e) => setNewAmenity(e.target.value)}
                                sx={{ flex: 1 }}
                            />
                            <Button variant="outlined" onClick={handleAddCustomAmenity} disabled={!newAmenity.trim()}>
                                Add
                            </Button>
                        </Box>
                    </Grid>

                    {/* Images */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Images (URL)
                            </Typography>
                            <Button startIcon={<AddIcon />} onClick={addImage} size="small">
                                Add URL
                            </Button>
                        </Box>
                        {formData.images.map((img, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="https://example.com/image.jpg"
                                    value={img}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                />
                                <IconButton onClick={() => removeImage(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<SaveIcon />}
                            disabled={isLoading}
                            sx={{ mt: 2, borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            {isLoading ? 'Saving...' : 'Save Hotel'}
                        </Button>
                    </Grid>

                </Grid>
            </form>
        </Paper>
    );
};

export default HotelForm;
