import React from 'react';
import { Box, Typography, Card, Button, Avatar, Grid } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

interface ReviewsListProps {
    reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return <Typography variant="body2" color="text.secondary">No reviews yet.</Typography>;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Reviews</Typography>
            <Grid container spacing={2}>
                {reviews.map((review) => (
                    <Grid item xs={12} md={6} key={review.id}>
                        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                                    {review.userName.charAt(0)}
                                </Avatar>
                                <Typography variant="subtitle2" fontWeight="bold">{review.userName}</Typography>
                                <Box sx={{ flexGrow: 1 }} />
                                <StarIcon sx={{ fontSize: 16, color: 'gold', mr: 0.5 }} />
                                <Typography variant="body2" fontWeight="bold">{review.rating}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {review.comment}
                            </Typography>
                            <Typography variant="caption" color="text.gray" display="block" sx={{ mt: 1 }}>
                                {new Date(review.date).toLocaleDateString()}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ReviewsList;
