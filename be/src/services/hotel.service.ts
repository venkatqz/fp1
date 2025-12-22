import { HotelRepository } from '../repositories/hotel.repo';
import { HotelDTO, SearchHotelRequestDTO, SearchHotelResponseDTO, toHotelDTO } from '../apicontract';

export const HotelService = {
    searchHotels: async (params: SearchHotelRequestDTO): Promise<SearchHotelResponseDTO> => {
        const {
            query,
            checkIn,
            checkOut,
            limit = 12,
            page = 1,
            sortBy
        } = params;

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        //default dates
        const cIn = checkIn || new Date().toISOString().split('T')[0];
        const cOut = checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const rawHotels = await HotelRepository.findAvailableHotels(
            (query as string) || '',
            (cIn as string),
            (cOut as string),
            limitNum,
            skip,
            (sortBy as string) || 'rating'
        ) as unknown as string[];

        // Map raw results to DTO
        const hotelDTOs = rawHotels.map((h: any) => ({
            id: h.id,
            name: h.name,
            city: h.city,
            address: h.address,
            description: h.description,
            rating: Number(h.rating),
            avg_rating: Number(h.rating), // Mapping for new field
            starting_price: Number(h.starting_price || 0),
            lowestPrice: Number(h.starting_price || 0), // Kept for backward compatibility
            // Images are stored as JSON string in DB
            images: typeof h.images == 'string' ? JSON.parse(h.images) : h.images,

            hotel_amenities: h.hotel_amenities || '',
            manager_names: h.manager_names ? (typeof h.manager_names == 'string' ? JSON.parse(h.manager_names) : h.manager_names) : [],
            rooms_details: h.rooms_details ? (typeof h.rooms_details == 'string' ? JSON.parse(h.rooms_details) : h.rooms_details) : [],


            amenities: []
        }));

        return {
            data: hotelDTOs,
            meta: {
                total: hotelDTOs.length,
                page: pageNum,
                limit: limitNum
            }
        };
    },

    getHotelById: async (id: string): Promise<HotelDTO | null> => {
        const hotel = await HotelRepository.findById(id);

        if (!hotel) return null;

        return toHotelDTO(hotel);
    }
};
