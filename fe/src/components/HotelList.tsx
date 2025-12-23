import React from 'react';
import {
    Grid,
} from '@mui/material';
import HotelCard from './HotelCard';
import HotelTable from './HotelTable';
import { withManagerActions } from './withManagerActions';
import type { Hotel } from '../client/models/Hotel';

// Extended type to include properties from Search API that might be missing in generated client
interface SearchResultHotel extends Hotel {
    starting_price?: number;
    hotel_amenities?: string;
}

interface HotelListProps {
    hotels: SearchResultHotel[];
    viewMode: 'grid' | 'list';
    onEdit?: (hotel: SearchResultHotel) => void;
    onDelete?: (hotel: SearchResultHotel) => void;
    isManager?: boolean;
}

const HotelList: React.FC<HotelListProps> = ({ hotels, viewMode, onEdit, onDelete, isManager = false }) => {
    if (viewMode === 'grid') {
        // Only use HOC if we have both edit and delete handlers (manager mode)
        const shouldUseManagerActions = isManager && onEdit && onDelete;

        if (shouldUseManagerActions) {
            const ManagerCard = withManagerActions(HotelCard);
            return (
                <Grid container spacing={3}>
                    {hotels.map((hotel) => (
                        <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                            <ManagerCard
                                hotel={hotel as any}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        </Grid>
                    ))}
                </Grid>
            );
        }

        // Regular customer view
        return (
            <Grid container spacing={3}>
                {hotels.map((hotel) => (
                    <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                        <HotelCard hotel={hotel as any} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    // List/Table view - works for both customer and manager
    return (
        <HotelTable
            hotels={hotels}
            isManager={isManager}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
};

export default HotelList;
